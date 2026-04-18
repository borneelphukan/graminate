import { Icon, Button } from "@graminate/ui";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import axios, { AxiosError } from "axios";
import ChatWindow from "@/layout/ChatWindow";
import axiosInstance from "@/lib/utils/axiosInstance";
import InfoModal from "@/components/modals/InfoModal";
import CookieDisclaimer from "@/components/ui/CookieDisclaimer";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import FirstLoginModal from "@/components/modals/FirstLoginModal";

type Props = {
  children: React.ReactNode;
};

const PlatformLayout = ({ children }: Props) => {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    text: "",
    variant: "error" as "success" | "error" | "info" | "warning",
  });

  const router = useRouter();
  const { user_id } = router.query;

  const { isFirstLogin, fetchUserSubTypes } = useUserPreferences();

  // Floating Chat Button Position and Dragging
  const [chatPos, setChatPos] = useState({ x: -1, y: -1 });
  const [isDocked, setIsDocked] = useState(false);
  const [dockSide, setDockSide] = useState<"left" | "right">("right");
  const dragInfo = useRef({ 
    isDragging: false, 
    startX: 0, 
    startY: 0, 
    moved: false,
    lastX: 0,
    lastY: 0
  });

  useEffect(() => {
    const sidebarWidth = window.innerWidth > 1024 ? 260 : 0;
    const margin = 16;
    const buttonSize = 56;

    if (chatPos.x === -1) {
      setChatPos({
        x: window.innerWidth - buttonSize - margin,
        y: window.innerHeight - buttonSize - margin,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragInfo.current.isDragging) return;
      
      const dx = e.clientX - dragInfo.current.startX;
      const dy = e.clientY - dragInfo.current.startY;
      
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragInfo.current.moved = true;
      }

      setChatPos((prev) => {
        let newX = prev.x + dx;
        let newY = prev.y + dy;

        const navbarHeight = 64;
        
        // Allow temporary free movement during drag, but limit to loosely within screen
        newX = Math.max(-20, Math.min(window.innerWidth - 30, newX));
        newY = Math.max(navbarHeight, Math.min(window.innerHeight - 50, newY));

        return { x: newX, y: newY };
      });

      dragInfo.current.startX = e.clientX;
      dragInfo.current.startY = e.clientY;
    };

    const handleMouseUp = () => {
      if (!dragInfo.current.isDragging) return;
      dragInfo.current.isDragging = false;
      document.body.style.userSelect = "";

      const sidebarWidth = window.innerWidth > 1024 ? 260 : 0;
      const margin = 16;
      const buttonSize = 56;
      const halfWindow = (window.innerWidth + sidebarWidth) / 2;

      setChatPos((prev) => {
        let finalX;
        let finalY = Math.max(72, Math.min(window.innerHeight - buttonSize - margin, prev.y));
        
        // Check for Docking (hiding at edges) - ONLY FOR RIGHT
        if (prev.x > window.innerWidth - buttonSize - 5) {
          setIsDocked(true);
          setDockSide("right");
          finalX = window.innerWidth - buttonSize / 2;
        } else {
          setIsDocked(false);
          // Snap to Left or Right
          if (prev.x < halfWindow) {
            finalX = sidebarWidth + margin; // Always fully visible on left
            setDockSide("left");
          } else {
            finalX = window.innerWidth - buttonSize - margin;
            setDockSide("right");
          }
        }
        return { x: finalX, y: finalY };
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [chatPos.x]);

  const handleDragStart = (e: React.MouseEvent) => {
    dragInfo.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      lastX: chatPos.x,
      lastY: chatPos.y
    };
    document.body.style.userSelect = "none";
  };

  const handleChatToggle = () => {
    if (!dragInfo.current.moved) {
      if (isDocked) {
        // Undock on click
        setIsDocked(false);
        const sidebarWidth = window.innerWidth > 1024 ? 260 : 0;
        const margin = 16;
        const buttonSize = 56;
        setChatPos(prev => ({
          ...prev,
          x: dockSide === "left" ? sidebarWidth + margin : window.innerWidth - buttonSize - margin
        }));
      } else {
        setIsChatOpen((prev) => !prev);
      }
    }
  };

  useEffect(() => {
    if (isSidebarOpen || isChatOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isSidebarOpen, isChatOpen]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    if (user_id) {
      setUserId(user_id as string);
    } else {
      setUserId("");
    }
  }, [user_id]);

  const verifySession = useCallback(
    async (currentUserId: string) => {
      setIsLoadingAuth(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthorized(false);
        setModalState({
          isOpen: true,
          title: "Unauthorized",
          text: "Please log in first.",
          variant: "error",
        });
        return;
      }

      try {
        await fetchUserSubTypes(currentUserId);
        setIsAuthorized(true);
      } catch (error: unknown) {
        setIsAuthorized(false);
        let errorText = "Session expired or unauthorized access.";
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 401) {
            errorText = "Session expired. Please log in again.";
          } else if (axiosError.response?.status === 404) {
            errorText = `User not found`;
          }
        }
        setModalState({
          isOpen: true,
          title: "Access Denied",
          text: errorText,
          variant: "error",
        });
      } finally {
        setIsLoadingAuth(false);
      }
    },
    [fetchUserSubTypes]
  );

  useEffect(() => {
    const accountJustDeleted = sessionStorage.getItem("accountJustDeleted");
    if (accountJustDeleted === "true") {
      sessionStorage.removeItem("accountJustDeleted");
      setIsLoadingAuth(false);
      setIsAuthorized(false);
      return;
    }
    if (!router.isReady) {
      setIsLoadingAuth(true);
      return;
    }
    if (!user_id) {
      setIsLoadingAuth(false);
      setIsAuthorized(false);
      return;
    }
    setIsAuthorized(false);
    verifySession(user_id as string).catch(console.error);
  }, [router.isReady, user_id, verifySession]);

  const handleFirstLoginSubmit = useCallback(
    async (
      businessName: string,
      businessType: string,
      subTypes?: string[],
      addressLine1?: string,
      addressLine2?: string,
      city?: string,
      state?: string,
      postalCode?: string
    ) => {
      try {
        await axiosInstance.put(`/user/${userId}/first-login-setup`, {
          business_name: businessName,
          business_type: businessType,
          sub_type: subTypes,
          address_line_1: addressLine1,
          address_line_2: addressLine2,
          city,
          state,
          postal_code: postalCode,
        });

        await fetchUserSubTypes(userId);

        setModalState({
          isOpen: true,
          title: "Setup Complete!",
          text: "Welcome aboard! Your profile is now ready.",
          variant: "success",
        });
      } catch (error) {
        console.error("Failed to save first login details:", error);
        setModalState({
          isOpen: true,
          title: "Setup Failed",
          text: "We couldn't save your details. Please try again.",
          variant: "error",
        });
        throw error;
      }
    },
    [userId, fetchUserSubTypes]
  );

  if (!router.isReady || isLoadingAuth) {
    return null;
  }
  if (!isAuthorized) {
    return (
      <>
        <InfoModal
          isOpen={modalState.isOpen}
          onClose={() => {
            setModalState((prev) => ({ ...prev, isOpen: false }));
            router.push("/");
          }}
          title={modalState.title}
          text={modalState.text}
          variant={modalState.variant}
        />
      </>
    );
  }

  return (
    <>
      <FirstLoginModal
        isOpen={isFirstLogin}
        userId={userId}
        onSubmit={handleFirstLoginSubmit}
        onClose={() => {}}
      />

      <div className="flex flex-col min-h-screen bg-light dark:bg-dark text-dark dark:text-light">
        <div className="z-50">
          <Navbar
            userId={userId}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        <div className="flex flex-1 max-h-screen relative">
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <Sidebar isOpen={isSidebarOpen} userId={userId} />

          <div
            className={`flex-1 p-4 overflow-y-auto ${
              isSidebarOpen ? "overflow-hidden" : ""
            }`}
          >
            {children}
          </div>
        </div>

        <div
          style={
            chatPos.x !== -1
              ? {
                  position: "fixed",
                  left: `${chatPos.x}px`,
                  top: `${chatPos.y}px`,
                  zIndex: 50,
                  transition: dragInfo.current.isDragging ? "none" : "all 0.3s ease-out",
                }
              : {
                  position: "fixed",
                  bottom: "16px",
                  right: "16px",
                  zIndex: 50,
                }
          }
          onMouseDown={handleDragStart}
        >
          <Button
            onClick={handleChatToggle}
            variant={isDocked ? "ghost" : "outline"}
            shape={isDocked ? "default" : "circle"}
            className={`h-14 w-14 shadow-lg active:scale-95 transition-all relative ${
              dragInfo.current.isDragging ? "cursor-grabbing" : "cursor-grab"
            } ${
              isDocked
                ? `opacity-50 hover:opacity-100 ${
                    dockSide === "left"
                      ? "rounded-l-none rounded-r-lg"
                      : "rounded-r-none rounded-l-lg"
                  }`
                : ""
            }`}
          >
            {isDocked ? (
              <Icon
                type={dockSide === "left" ? "chevron_right" : "chevron_left"}
                className={`text-2xl! ${
                  dockSide === "left" ? "translate-x-4" : "-translate-x-4"
                } animate-pulse`}
              />
            ) : (
              <Icon type={"smart_toy"} size="lg" />
            )}
          </Button>
        </div>

        {isChatOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setIsChatOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ChatWindow userId={userId} />
            </div>
          </div>
        )}
      </div>

      <InfoModal
        isOpen={modalState.isOpen && !isAuthorized}
        onClose={() => {
          setModalState((prev) => ({ ...prev, isOpen: false }));
          if (!isAuthorized) router.push("/");
        }}
        title={modalState.title}
        text={modalState.text}
        variant={modalState.variant}
      />
      <CookieDisclaimer />
    </>
  );
};

export default PlatformLayout;
