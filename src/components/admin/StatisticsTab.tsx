'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, CheckCircle, Clock, FileText } from 'lucide-react';

interface StatisticsTabProps {
  bookings: any[];
  invoices: any[];
}

type DateFilter = 'week' | 'month' | 'year' | 'all';

export default function StatisticsTab({ bookings, invoices }: StatisticsTabProps) {
  const [filter, setFilter] = useState<DateFilter>('all');

  // Filter Data based on selected time range
  const { filteredBookings, filteredInvoices } = useMemo(() => {
    const now = new Date();
    
    // Set start date based on filter
    let startDate = new Date(0); // For 'all'
    if (filter === 'week') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else if (filter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filter === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filteredB = bookings.filter(b => new Date(b.createdAt) >= startDate);
    const filteredI = invoices.filter(i => new Date(i.createdAt) >= startDate);

    return { filteredBookings: filteredB, filteredInvoices: filteredI };
  }, [filter, bookings, invoices]);

  // Calculate KPIs
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaidRevenue = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const validatedBookings = filteredBookings.filter(b => ['confirmed', 'completed'].includes(b.status)).length;
  const completedBookings = filteredBookings.filter(b => b.status === 'completed').length;
  const totalInvoices = filteredInvoices.length;

  // Prepare Data for Charts

  // 1. Revenue Chart (Bar)
  const revenueChartData = useMemo(() => {
    // Group invoices by date
    const groups: Record<string, number> = {};
    
    filteredInvoices.forEach(inv => {
      const dateStr = new Date(inv.createdAt).toLocaleDateString('fr-FR', {
        month: 'short', 
        day: 'numeric'
      });
      groups[dateStr] = (groups[dateStr] || 0) + inv.totalAmount;
    });

    // Convert to array and sort (simple sort by string might not be perfect, but works for short date ranges)
    return Object.keys(groups).map(key => ({
      name: key,
      total: groups[key]
    }));
  }, [filteredInvoices]);

  // 2. Booking Status Chart (Pie)
  const bookingStatusData = useMemo(() => {
    const counts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    
    filteredBookings.forEach(b => {
      if (counts[b.status as keyof typeof counts] !== undefined) {
        counts[b.status as keyof typeof counts]++;
      }
    });

    return [
      { name: 'En attente', value: counts.pending, color: '#f59e0b' }, // yellow-500
      { name: 'Confirmée', value: counts.confirmed, color: '#3b82f6' }, // blue-500
      { name: 'Terminée', value: counts.completed, color: '#10b981' }, // green-500
      { name: 'Annulée', value: counts.cancelled, color: '#ef4444' } // red-500
    ].filter(item => item.value > 0);
  }, [filteredBookings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de Bord</h2>
          <p className="text-muted-foreground">Vue d'ensemble de vos performances et statistiques.</p>
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={filter} onValueChange={(value: DateFilter) => setFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Les 7 derniers jours</SelectItem>
              <SelectItem value="month">Ce mois-ci</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="all">Depuis le début</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Générés</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} $</div>
            <p className="text-xs text-muted-foreground">
              Dont payé : {totalPaidRevenue.toFixed(2)} $
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations Validées</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{validatedBookings}</div>
            <p className="text-xs text-muted-foreground">
              Sur {filteredBookings.length} au total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services Terminés</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{completedBookings}</div>
            <p className="text-xs text-muted-foreground">
              Prestations finalisées
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Factures générées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Évolution des Revenus</CardTitle>
            <CardDescription>Montant des factures générées sur la période sélectionnée.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 12 }} 
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      formatter={(value: number) => [`${value.toFixed(2)} $`, 'Revenus']}
                    />
                    <Bar dataKey="total" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Aucune donnée disponible pour cette période
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Statut des Réservations</CardTitle>
            <CardDescription>Répartition des statuts de réservations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {bookingStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {bookingStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Aucune réservation pour cette période
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
