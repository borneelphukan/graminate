import { Link } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-gray-900">
      <Text className="font-bold">This is a modal</Text>
      <Link href="/" dismissTo className="mt-4">
        <Text className="text-emerald-600">Go to home screen</Text>
      </Link>
    </View>
  );
}
