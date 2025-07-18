import {
  Briefcase,
  BarChart3,
  Users,
  Settings,
  MessageSquare,
  GraduationCap,
  ArrowRight,
  LayoutDashboard,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import hexaLogo from "@/assets/images/logo.png";

interface NavItem {
  name: string;
  icon: React.ElementType;
  href: string;
}

const generalNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Dự án", icon: Briefcase, href: "/projects" },
  { name: "Báo cáo", icon: BarChart3, href: "/reports" },
  { name: "Nhân sự", icon: Users, href: "/staff" },
];

const chatbotNavItems: NavItem[] = [
    { name: "Hộp thư Chatbot", icon: MessageSquare, href: "/chatbot-inbox" },
    { name: "Cài đặt Chatbot", icon: Settings, href: "/chatbot-settings" },
    { name: "Training Chatbot", icon: GraduationCap, href: "/training-chatbot" },
]

const supportNavItems: NavItem[] = [
    { name: "Cài đặt API AI", icon: Settings, href: "/settings" },
];

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

interface StaffProfile {
  name: string;
  role: string | null;
  avatar_url: string | null;
}

export function Sidebar({ className, isCollapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const { data: staffProfile, error } = await supabase
            .from('staff')
            .select('name, role, avatar_url')
            .eq('email', user.email)
            .single();
          
          if (error) {
            console.warn('Error fetching staff profile, falling back to auth user:', error.message);
            setProfile({
                name: user.user_metadata?.full_name || user.email || 'Người dùng',
                role: 'Thành viên',
                avatar_url: user.user_metadata?.avatar_url
            });
          } else {
            setProfile(staffProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error('Exception fetching profile', e);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };
  
    fetchProfile();
  
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, _session) => {
        fetchProfile();
    });
  
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return '...';
    const names = name.trim().split(' ');
    if (names.length > 1 && names[names.length - 1]) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderLink = (item: NavItem) => {
    const linkContent = (
      <Link
        to={item.href}
        className={cn(
          "flex items-center rounded-lg py-2.5 text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600",
          location.pathname === item.href && "bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
          isCollapsed ? "justify-center px-3" : "px-4"
        )}
      >
        <item.icon className={cn("h-5 w-5 transition-all", !isCollapsed && "mr-3")} />
        <span className={cn("transition-all", isCollapsed && "sr-only")}>{item.name}</span>
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent side="right" className="bg-blue-600 text-white border-blue-600">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return linkContent;
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-white text-zinc-800 space-y-6 border-r border-slate-100 relative transition-all duration-300",
        isCollapsed ? "p-3" : "p-6",
        className
      )}
    >
      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-8 h-8 w-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 z-10"
        onClick={toggleSidebar}
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
      </Button>

      {/* Logo */}
      <div className={cn("flex items-center", isCollapsed ? "justify-center h-10" : "")}>
        {isCollapsed ? (
          <div className="bg-blue-600 rounded-lg p-2 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
        ) : (
          <img src={hexaLogo} alt="HEXA Logo" className="w-4/5 h-auto mx-auto" />
        )}
      </div>

      {/* User Profile */}
      <div className={cn("flex items-center justify-between rounded-lg bg-white p-2 transition-opacity duration-200 min-h-[60px]", isCollapsed && "opacity-0 hidden")}>
        {loadingProfile ? (
            <div className="flex items-center space-x-3 animate-pulse w-full">
                <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                </div>
            </div>
        ) : profile ? (
            <>
                <div className="flex items-center space-x-3 overflow-hidden">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate" title={profile.name}>{profile.name}</p>
                        <p className="text-xs text-gray-500 truncate" title={profile.role || 'Thành viên'}>{profile.role || 'Thành viên'}</p>
                    </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0" />
            </>
        ) : (
            <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                    <AvatarFallback>??</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">Chưa đăng nhập</p>
                </div>
            </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col space-y-6 overflow-y-auto">
        <div>
            <p className={cn("px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 transition-opacity duration-200", isCollapsed && "opacity-0 hidden")}>General</p>
            <nav className="flex flex-col space-y-1">
                {generalNavItems.map(renderLink)}
            </nav>
        </div>
        
        <div>
            <p className={cn("px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 transition-opacity duration-200", isCollapsed && "opacity-0 hidden")}>Chatbot</p>
            <nav className="flex flex-col space-y-1">
                {chatbotNavItems.map(renderLink)}
            </nav>
        </div>
      </div>

      {/* Support/Settings at the bottom */}
       <div className="mt-auto">
         <p className={cn("px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 transition-opacity duration-200", isCollapsed && "opacity-0 hidden")}>Support</p>
         <nav className="flex flex-col space-y-1">
            {supportNavItems.map(renderLink)}
         </nav>
       </div>
    </div>
  );
}