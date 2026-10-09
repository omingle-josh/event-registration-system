import { useState } from "react";
import { QrCode, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { verifyTicket, TicketVerificationResponse } from "../../registrations/api/bookingsApi";
import toast from "react-hot-toast";

export function CheckInPage() {
  const [rawData, setRawData] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<TicketVerificationResponse | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawData.trim()) return;

    setIsVerifying(true);
    setResult(null);

    try {
      const response = await verifyTicket(rawData);
      setResult(response);
      if (response.valid) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
      setResult({
        valid: false,
        message: err.response?.data?.message || "Internal server error"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80')]">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      
      <div className="relative mx-auto w-full max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="border-brand-300/20 bg-slate-900/90 shadow-2xl">
          <CardHeader className="text-center pb-8 border-b border-slate-700/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/20">
              <QrCode className="h-10 w-10 text-brand-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">Event Check-in</CardTitle>
            <CardDescription className="text-slate-400">
              Paste the ticket data or scan the QR code to verify entry.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 space-y-8">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <Input
                  className="h-14 pl-12 rounded-2xl border-slate-700 bg-slate-950/50 text-white focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="Paste ticket data (e.g. 123:abc...)"
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="gradient"
                className="w-full h-14 rounded-2xl text-lg font-bold"
                disabled={isVerifying || !rawData.trim()}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Check-in"
                )}
              </Button>
            </form>

            {result && (
              <div
                className={cn(
                  "rounded-3xl p-8 border text-center space-y-4 animate-in fade-in zoom-in duration-300",
                  result.valid
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-rose-500/10 border-rose-500/30"
                )}
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                  {result.valid ? (
                    <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                  ) : (
                    <XCircle className="h-12 w-12 text-rose-400" />
                  )}
                </div>
                
                <div>
                  <h3 className={cn(
                    "text-2xl font-bold",
                    result.valid ? "text-emerald-300" : "text-rose-300"
                  )}>
                    {result.valid ? "Access Granted" : "Access Denied"}
                  </h3>
                  <p className="mt-2 text-slate-300 font-medium">{result.message}</p>
                </div>

                {result.valid && (
                  <div className="pt-4 mt-6 border-t border-white/5 space-y-2 text-left">
                    <p className="text-sm text-slate-400">Attendee Details:</p>
                    <p className="text-white font-semibold flex justify-between">
                      <span className="text-slate-400 font-normal">ID:</span>
                      #{result.registrationId}
                    </p>
                    <p className="text-white font-semibold flex justify-between">
                      <span className="text-slate-400 font-normal">Email:</span>
                      {result.userEmail}
                    </p>
                    <p className="text-white font-semibold flex justify-between">
                      <span className="text-slate-400 font-normal">Status:</span>
                      <span className="text-brand-300">{result.currentStatus}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
