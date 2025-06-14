export function BackgroundShapes() {
  return (
    <>
      <div className="absolute top-20 -left-16 w-32 h-64 bg-[#00A5B1]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-16 w-32 h-64 bg-[#00A5B1]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#00A5B1]/5 rounded-full blur-2xl"></div>
    </>
  );
}

export function RightPanelGradients() {
  return (
    <>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#00A5B1]/20 to-transparent blur-3xl animate-pulse-slow"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-radial from-[#7fdddf]/25 to-transparent blur-3xl opacity-70"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-radial from-[#00c2d1]/20 to-transparent blur-3xl opacity-80"></div>
      <div className="absolute bottom-1/3 -left-20 w-80 h-80 rounded-full bg-gradient-radial from-[#97e3e9]/30 to-transparent blur-2xl"></div>
      <div className="absolute top-2/3 right-1/6 w-60 h-60 rounded-full bg-gradient-radial from-[#b5edf1]/25 to-transparent blur-2xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20"></div>
    </>
  );
}
