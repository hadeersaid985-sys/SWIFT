import React from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const TopPerformerLeaderboard: React.FC = () => {
  const { team, tasks } = useCRM();

  // Calculate scores for all team members
  const leaderboard = team.map(member => {
    const memberTasks = tasks.filter(t => t.assignedToId === member.id);
    const completedTasks = memberTasks.filter(t => t.status === 'completed');
    const totalMinutes = memberTasks.reduce((acc, t) => acc + (t.totalLoggedMinutes || 0), 0);
    const loggedHours = Number((totalMinutes / 60).toFixed(1));
    
    // Points formula: 10 points per completed task + 2 points per logged hour + 5 points if active today
    const score = (completedTasks.length * 10) + Math.round(loggedHours * 2);

    return {
      member,
      completedCount: completedTasks.length,
      loggedHours,
      score
    };
  }).sort((a, b) => b.score - a.score);

  const champion = leaderboard[0];
  const runnerUp = leaderboard[1];
  const thirdPlace = leaderboard[2];

  if (!champion) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <span>لوحة التميز وموظف الشهر المتصدر</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                Leaderboard 👑
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              يتم احتساب النقاط تلقائياً بناءً على إنجاز المهام وساعات العمل المسجلة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>تحديث فوري</span>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1st Place - Champion */}
        <div className="relative sm:order-2 bg-gradient-to-b from-amber-50 to-amber-100/60 p-4 rounded-2xl border-2 border-amber-400 shadow-sm flex flex-col items-center text-center space-y-2">
          <div className="absolute -top-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <span>👑 المركز الأول</span>
          </div>

          <div className="relative pt-2">
            <img
              src={champion.member.avatar}
              alt={champion.member.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center absolute -bottom-1 -right-1 border border-white">
              1
            </span>
          </div>

          <div>
            <h4 className="font-black text-slate-900 text-sm">{champion.member.name}</h4>
            <div className="text-[10px] text-amber-800 font-bold">{champion.member.role}</div>
          </div>

          <div className="w-full pt-2 border-t border-amber-200/80 flex items-center justify-around text-[11px] font-bold">
            <div className="text-emerald-700">
              <span className="block text-[10px] text-slate-500 font-normal">المهام:</span>
              {champion.completedCount}
            </div>
            <div className="text-blue-700">
              <span className="block text-[10px] text-slate-500 font-normal">الساعات:</span>
              {champion.loggedHours} س
            </div>
            <div className="text-amber-800 font-black">
              <span className="block text-[10px] text-slate-500 font-normal">النقاط:</span>
              {champion.score}
            </div>
          </div>
        </div>

        {/* 2nd Place */}
        {runnerUp && (
          <div className="sm:order-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-2">
            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              🥈 المركز الثاني
            </span>

            <div className="relative">
              <img
                src={runnerUp.member.avatar}
                alt={runnerUp.member.name}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-300"
              />
              <span className="w-5 h-5 rounded-full bg-slate-400 text-white font-bold text-[11px] flex items-center justify-center absolute -bottom-1 -right-1 border border-white">
                2
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-800 text-xs">{runnerUp.member.name}</h4>
              <div className="text-[10px] text-slate-500">{runnerUp.member.role}</div>
            </div>

            <div className="w-full pt-1.5 border-t border-slate-200 flex items-center justify-around text-[10px] font-bold">
              <span>{runnerUp.completedCount} مهام</span>
              <span>{runnerUp.loggedHours} س</span>
              <span className="text-blue-700 font-black">{runnerUp.score} نقطة</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {thirdPlace && (
          <div className="sm:order-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-2">
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              🥉 المركز الثالث
            </span>

            <div className="relative">
              <img
                src={thirdPlace.member.avatar}
                alt={thirdPlace.member.name}
                className="w-13 h-13 rounded-2xl object-cover border border-amber-300"
              />
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center absolute -bottom-1 -right-1 border border-white">
                3
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-800 text-xs">{thirdPlace.member.name}</h4>
              <div className="text-[10px] text-slate-500">{thirdPlace.member.role}</div>
            </div>

            <div className="w-full pt-1.5 border-t border-slate-200 flex items-center justify-around text-[10px] font-bold">
              <span>{thirdPlace.completedCount} مهام</span>
              <span>{thirdPlace.loggedHours} س</span>
              <span className="text-amber-800 font-black">{thirdPlace.score} نقطة</span>
            </div>
          </div>
        )}
      </div>

      {/* Mini Progress List for all members */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="text-[11px] font-bold text-slate-600">ترتيب باقي أعضاء الفريق:</div>
        <div className="space-y-1.5">
          {leaderboard.slice(3).map((item, idx) => {
            const maxScore = champion.score || 1;
            const percent = Math.min(100, Math.round((item.score / maxScore) * 100));

            return (
              <div key={item.member.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/70 text-xs hover:bg-slate-100/70 transition-colors">
                <span className="w-5 text-slate-400 font-bold text-[11px] text-center">{idx + 4}</span>
                <img src={item.member.avatar} alt={item.member.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate">{item.member.name}</span>
                    <span className="font-black text-amber-700 text-[11px]">{item.score} نقطة</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-gradient-to-r from-blue-500 to-amber-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
