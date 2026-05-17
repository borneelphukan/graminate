import React, { useState } from "react";
import { Dimensions, View } from "react-native";
import { Button, IconButton, Menu, Surface } from "@/components/ui";

type NavButton = {
  name: string;
  view: string;
};

type NavPanelProps = {
  buttons: NavButton[];
  activeView: string;
  onNavigate: (view: string) => void;
};

const MOBILE_BREAKPOINT = 768;

const NavPanel = ({ buttons, activeView, onNavigate }: NavPanelProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { width } = Dimensions.get("window");
  const isMobileLayout = width < MOBILE_BREAKPOINT;

  const renderTabBar = () => (
    <Surface className="flex-row" elevation={2}>
      {buttons.map(({ name, view }) => {
        const isActive = activeView === view;
        return (
          <Button
            key={view}
            onPress={() => onNavigate(view)}
            mode={isActive ? "contained-tonal" : "text"}
            className="flex-1 rounded-none py-2"
          >
            {name}
          </Button>
        );
      })}
    </Surface>
  );

  const renderMobileMenu = () => (
    <View className="w-full items-center p-2">
      <Menu
        visible={isMenuOpen}
        onDismiss={() => setIsMenuOpen(false)}
        anchor={
          <IconButton
            icon="menu"
            size={24}
            onPress={() => setIsMenuOpen(true)}
          />
        }
      >
        {buttons.map(({ name, view }) => (
          <Menu.Item
            key={view}
            title={name}
            onPress={() => {
              onNavigate(view);
              setIsMenuOpen(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );

  return isMobileLayout ? renderMobileMenu() : renderTabBar();
};

export default NavPanel;
