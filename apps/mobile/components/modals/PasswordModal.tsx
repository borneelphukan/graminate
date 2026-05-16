import React, { ReactNode } from "react";
import { View } from "react-native";
import {
  Card,
  Divider,
  IconButton,
  Modal,
  Portal,
  Text,
} from "@/components/ui";

type PasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  children: ReactNode;
  footerContent?: ReactNode;
};

const PasswordModal = ({
  isOpen,
  onClose,
  title,
  children,
  footerContent,
}: PasswordModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <Modal visible={isOpen} onDismiss={onClose} className="m-5">
        <Card>
          {title && (
            <>
              <View className="flex-row justify-between items-center pl-6 pr-3 py-2">
                <Text>{title}</Text>
                <IconButton icon="close" size={24} onPress={onClose} />
              </View>
              <Divider />
            </>
          )}
          <Card.Content className="pt-6 pb-4">{children}</Card.Content>
          {footerContent && (
            <Card.Actions className="p-4 justify-end">
              {footerContent}
            </Card.Actions>
          )}
        </Card>
      </Modal>
    </Portal>
  );
};

export default PasswordModal;
