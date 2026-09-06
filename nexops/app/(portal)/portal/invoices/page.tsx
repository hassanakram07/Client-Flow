"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { Invoice } from "@/lib/types";
import { Download, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  cn, formatCurrency, formatDate,
  invoiceStatusVariant, invoiceStatusLabel,
} from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonTable } from "@/components/ui/skeleton";

export default function PortalInvoicesPage() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices", { clientId: user?.clientId }],
    queryFn: () => fetch(`/api/invoices?clientId=${user!.clientId}`).then(r => r.json()),
    enabled: !!user?.clientId,
  });

  const totalOutstanding = invoices
    .filter(i => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices
    .filter(i => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);
  const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoices & Billing Statements</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access itemized retainer invoices, payment statuses, and downloadable VAT receipts.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Outstanding Balance</span>
          <span className={cn("text-2xl font-bold font-mono mt-1 block", totalOutstanding > 0 ? "text-amber-600" : "text-slate-900")}>
            {formatCurrency(totalOutstanding)}
          </span>
          <p className="text-xs text-slate-500 mt-1">Due according to NET-30 terms</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Total Paid & Settled</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono mt-1 block">
            {formatCurrency(totalPaid)}
          </span>
          <p className="text-xs text-slate-500 mt-1">Processed electronic payments</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Total Lifetime Billed</span>
          <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
            {formatCurrency(totalBilled)}
          </span>
          <p className="text-xs text-slate-500 mt-1">Contracted engagement total</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Billing History & Line Items</h2>
          <span className="text-xs font-mono text-slate-500">{invoices.length} statements</span>
        </div>

        {isLoading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No billing records issued for your organization.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map(inv => {
              const isOpen = expanded === inv.id;
              return (
                <div key={inv.id}>
                  <div
                    className="flex items-center justify-between p-5 hover:bg-slate-50/70 transition-colors cursor-pointer gap-4"
                    onClick={() => setExpanded(isOpen ? null : inv.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100 font-mono font-bold text-xs">
                        INV
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-slate-900">{inv.invoiceNumber}</span>
                          <StatusBadge variant={invoiceStatusVariant(inv.status)} label={invoiceStatusLabel(inv.status)} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          Due date: {formatDate(inv.dueDate)}
                          {inv.paidAt && ` · Settled on ${formatDate(inv.paidAt)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 flex-shrink-0">
                      <span className="text-base font-bold font-mono text-slate-900">
                        {formatCurrency(inv.amount, inv.currency)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Downloading PDF for invoice ${inv.invoiceNumber}…`);
                        }}
                        className="btn btn-secondary btn-sm text-xs font-semibold"
                        title="Download Statement PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                      <button className="p-1 text-slate-400">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Itemized Line Items Drawer */}
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-6 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Statement Breakdown
                      </h4>
                      <table className="data-table bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <thead>
                          <tr>
                            <th>Deliverable Description</th>
                            <th className="text-right">Quantity</th>
                            <th className="text-right">Unit Rate</th>
                            <th className="text-right">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {inv.lineItems.map(li => (
                            <tr key={li.id}>
                              <td className="text-xs font-medium text-slate-800">{li.description}</td>
                              <td className="text-right font-mono text-xs text-slate-600">{li.quantity}</td>
                              <td className="text-right font-mono text-xs text-slate-600">{formatCurrency(li.unitPrice)}</td>
                              <td className="text-right font-mono text-xs font-bold text-slate-900">{formatCurrency(li.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 border-t border-slate-200">
                            <td colSpan={3} className="text-right text-xs font-bold text-slate-700">Total Invoice Amount:</td>
                            <td className="text-right font-mono text-sm font-bold text-blue-700">
                              {formatCurrency(inv.amount, inv.currency)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
