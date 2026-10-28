import React from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ClientRenewal } from '../../types/crm';
import { SwiftMyndLogo } from '../common/SwiftMyndLogo';
import { useCRM } from '../../context/CRMContext';

interface ClientInvoiceModalProps {
  client: ClientRenewal | null;
  onClose: () => void;
}

export const ClientInvoiceModal: React.FC<ClientInvoiceModalProps> = ({ client, onClose }) => {
  if (!client) return null;
  const { brandConfig } = useCRM();

  const invoiceNumber = `INV-${new Date().getFullYear()}-${client.id.replace(/[^0-9]/g, '').slice(-4) || '1042'}`;
  const todayStr = new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-auto flex flex-col cursor-default"
      >
        {/* Top Action Bar (Hidden in Print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">فاتورة اشتراك العميل (Invoice)</h3>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
              {invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:scale-102"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة / حفظ PDF 🖨️</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div id="printable-invoice" className="p-4 sm:p-8 space-y-6 bg-white text-slate-900 print:p-0 print:m-0">
          {/* Invoice Header */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <SwiftMyndLogo variant="full" size="md" />
              <p className="text-xs text-slate-500 mt-2 font-medium">
                منظومة إدارة المهام وحسابات العملاء المتقدمة
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                support@swiftmynd.com • swiftmynd.com
              </p>
            </div>

            <div className="text-left dir-ltr space-y-1">
              <div className="text-2xl font-black text-slate-900 tracking-tight">INVOICE</div>
              <div className="text-xs font-mono font-bold text-blue-600">#{invoiceNumber}</div>
              <div className="text-[11px] text-slate-500 font-mono">Date: {todayStr}</div>
              <div className="text-[11px] text-slate-500 font-mono">Due: {client.renewalDate}</div>
            </div>
          </div>

          {/* Client & Billing Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">فاتورة إلى / Billed To:</span>
              <div className="font-black text-sm text-slate-900">{client.clientName}</div>
              {client.company && <div className="text-slate-600 font-bold">{client.company}</div>}
              {client.phone && <div className="text-slate-500 font-mono dir-ltr text-right">{client.phone}</div>}
              {client.email && <div className="text-slate-500 font-mono">{client.email}</div>}
            </div>

            <div className="space-y-1 text-left dir-ltr">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Payment Status:</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>اشتراك ساري / Active</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-sans">
                دورة السداد: <strong>{client.planCycle}</strong>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">م</th>
                  <th className="p-3">بيان الخدمة والباقة</th>
                  <th className="p-3">دورة الاشتراك</th>
                  <th className="p-3">تاريخ الاستحقاق القادم</th>
                  <th className="p-3 text-left dir-ltr">المبلغ الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3.5 font-bold text-slate-400">01</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{client.serviceName}</div>
                    <div className="text-[11px] text-slate-500">إدارة ومتابعة شيتات وملفات العميل والتقارير</div>
                  </td>
                  <td className="p-3.5 text-slate-600">{client.planCycle}</td>
                  <td className="p-3.5 font-mono text-slate-700">{client.renewalDate}</td>
                  <td className="p-3.5 font-black text-blue-700 text-left dir-ltr text-sm">
                    {client.amount.toLocaleString()} {client.currency}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500 space-y-1 max-w-sm">
              <div className="font-bold text-slate-700">شروط الدفع والتجديد:</div>
              <p className="text-[11px] leading-relaxed">
                يتم تجديد الخدمة وسيرفرات العمل بصورة دورية لضمان الاستقرار. للاستفسارات يسعدنا تواصلكم المباشر مع فريق الدعم الفني والإدارة.
              </p>
            </div>

            <div className="w-full sm:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>المبلغ الصافي:</span>
                <span className="font-mono font-bold">{client.amount.toLocaleString()} {client.currency}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>الضريبة / الرسوم:</span>
                <span className="font-mono font-bold">0.00 {client.currency}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
                <span>الإجمالي المستحق:</span>
                <span className="text-blue-600 font-mono">{client.amount.toLocaleString()} {client.currency}</span>
              </div>
            </div>
          </div>

          {/* Invoice Footer Seal */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>فاتورة معتمدة إلكترونياً من {brandConfig?.brandName || 'SWIFTMYND'}</span>
            </div>
            <div>شكراً لتعاملكم معنا!</div>
          </div>
        </div>

        {/* Modal Bottom (Hidden in print) */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            يمكنك حفظ الفاتورة بصيغة PDF عبر الضغط على زر "طباعة" واختيار (Save as PDF).
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
