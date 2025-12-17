import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  DollarSign, 
  FileText, 
  Download,
  BarChart3,
  PieChart,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const ResilienceReports = ({ businessId, businessName, businessType, location }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(12);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [businessId, selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/dashboard/${businessId}?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/export/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ period: selectedPeriod, format })
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const exportData = await response.json();
      
      // In a real implementation, this would trigger a file download
      console.log('Export data:', exportData);
      alert(`Report prepared for ${format.toUpperCase()} export. Download would start here.`);
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report');
    }
  };

  const getResilienceScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResilienceScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading reports: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No dashboard data available.
        </AlertDescription>
      </Alert>
    );
  }

  const { resilienceScore, emergencyFundData, riskAssessments, alerts, receipts, transactions, recommendations, benchmarking } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tokay Reports - Resilience Analytics</h2>
          <p className="text-gray-600">
            {businessName} • {businessType} • {location}
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
            <option value={24}>Last 24 Months</option>
          </select>
          <Button
            onClick={() => handleExport('pdf')}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            onClick={() => handleExport('excel')}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Resilience Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Resilience Score Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getResilienceScoreColor(resilienceScore.overall)}`}>
                {resilienceScore.overall}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Overall Score
              </div>
              <Badge className="mt-2" variant="secondary">
                {getResilienceScoreLabel(resilienceScore.overall)}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Emergency Fund</span>
                <span className="text-sm font-medium">{resilienceScore.emergencyFund}/100</span>
              </div>
              <Progress value={resilienceScore.emergencyFund} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Risk Management</span>
                <span className="text-sm font-medium">{resilienceScore.riskManagement}/100</span>
              </div>
              <Progress value={resilienceScore.riskManagement} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Alert Response</span>
                <span className="text-sm font-medium">{resilienceScore.alertResponse}/100</span>
              </div>
              <Progress value={resilienceScore.alertResponse} className="h-2" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Benchmarking</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Your Score:</span>
                  <span className="font-medium">{resilienceScore.overall}</span>
                </div>
                <div className="flex justify-between">
                  <span>Industry Avg:</span>
                  <span className="font-medium">{benchmarking.industryAverage}</span>
                </div>
                <div className="flex justify-between">
                  <span>Percentile:</span>
                  <span className="font-medium">{benchmarking.percentile}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="emergency-fund" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="emergency-fund">Emergency Fund</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="emergency-fund" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Emergency Fund Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    RM{emergencyFundData.currentBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Current Balance</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    RM{emergencyFundData.targetAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Target Amount</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {emergencyFundData.completionPercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Completion</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {emergencyFundData.monthsOfExpenses}
                  </div>
                  <div className="text-sm text-gray-600">Months Covered</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Monthly Contributions</h4>
                <div className="space-y-2">
                  {emergencyFundData.monthlyContributions.slice(0, 6).map((contribution, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{contribution.month}</span>
                      <span className="text-sm font-medium">RM{contribution.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Current Risk Level</h4>
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <Badge className={`text-lg px-4 py-2 ${getRiskLevelColor(riskAssessments.currentRiskLevel)}`}>
                      {riskAssessments.currentRiskLevel}
                    </Badge>
                    <div className="mt-2 text-sm text-gray-600">
                      Score: {riskAssessments.averageRiskScore}/100
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Risk Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(riskAssessments.riskDistribution).map(([level, count]) => (
                      <div key={level} className="flex justify-between items-center">
                        <Badge variant="outline" className={getRiskLevelColor(level)}>
                          {level}
                        </Badge>
                        <span className="text-sm font-medium">{count} assessments</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Top Risk Factors</h4>
                <div className="space-y-2">
                  {riskAssessments.topRiskFactors.map((factor, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-sm font-medium">{factor.factor}</span>
                      </div>
                      <Badge variant="destructive">{factor.impact}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alert Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{alerts.totalAlerts}</div>
                  <div className="text-sm text-gray-600">Total Alerts</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{alerts.resolvedAlerts}</div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{alerts.pendingAlerts}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{alerts.responseRate}%</div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Alert Types</h4>
                <div className="space-y-2">
                  {Object.entries(alerts.alertsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Receipt Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{receipts.totalReceipts}</div>
                  <div className="text-sm text-gray-600">Total Receipts</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    RM{receipts.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    RM{Math.round(receipts.averageAmount).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Average Amount</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Top Categories</h4>
                <div className="space-y-2">
                  {receipts.topCategories.map((category, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{category.category}</span>
                      <span className="text-sm font-medium">RM{category.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Transaction Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{transactions.totalDeposits}</div>
                  <div className="text-sm text-gray-600">Total Deposits</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{transactions.totalWithdrawals}</div>
                  <div className="text-sm text-gray-600">Total Withdrawals</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    RM{transactions.netFlow.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Net Flow</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    RM{transactions.averageTransactionAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Average Transaction</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Monthly Trend</h4>
                <div className="space-y-2">
                  {transactions.monthlyTrend.slice(0, 6).map((month, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{month.month}</span>
                      <div className="flex space-x-4">
                        <span className="text-sm text-green-600">
                          +RM{month.deposits.toLocaleString()}
                        </span>
                        <span className="text-sm text-red-600">
                          -RM{month.withdrawals.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {rec.priority === 'HIGH' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {rec.priority === 'MEDIUM' && <Clock className="h-4 w-4 text-yellow-600" />}
                  {rec.priority === 'LOW' && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">{rec.title}</h5>
                    <Badge variant={rec.priority === 'HIGH' ? 'destructive' : rec.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  {rec.actionable && (
                    <Button size="sm" variant="outline" className="mt-2">
                      Take Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResilienceReports;