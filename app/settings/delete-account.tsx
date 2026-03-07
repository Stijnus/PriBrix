import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { SettingsScreenLayout } from '@/src/components/ui/SettingsScreenLayout';
import { useAuth } from '@/src/features/auth/hooks';
import { useDeleteAccount } from '@/src/features/account/hooks';
import { colors } from '@/src/theme/colors';

export default function DeleteAccountScreen() {
  const { user } = useAuth();
  const deleteAccount = useDeleteAccount();
  const [confirmEmail, setConfirmEmail] = useState('');

  if (!user?.email) {
    return (
      <SettingsScreenLayout
        title="Delete Account"
        description="This action is only available while signed in."
      >
        <View className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Text className="text-sm text-neutral-600 dark:text-neutral-300">
            Sign in again before attempting account deletion.
          </Text>
        </View>
      </SettingsScreenLayout>
    );
  }

  const emailMatches = confirmEmail.trim().toLowerCase() === user.email.toLowerCase();

  async function handleDeleteAccount() {
    if (!emailMatches) {
      Alert.alert('Confirm your email', 'Type your account email exactly before continuing.');
      return;
    }

    Alert.alert(
      'Delete account permanently?',
      'This will delete your synced watchlist, alerts, wishlist, collection, push tokens, and your PriBrix account.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => {
            void deleteAccount
              .mutateAsync()
              .then(() => {
                Alert.alert('Account deleted', 'Your PriBrix account and local app data were removed.');
                router.replace('/');
              })
              .catch((error) => {
                Alert.alert(
                  'Could not delete account',
                  error instanceof Error ? error.message : 'Try signing in again and retry.',
                );
              });
          },
        },
      ],
    );
  }

  return (
    <SettingsScreenLayout
      title="Delete Account"
      description="This permanently removes your PriBrix account and all synced data."
    >
      <View className="gap-3 rounded-xl bg-warning-light p-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-warning">Permanent action</Text>
        <Text className="text-sm leading-6 text-neutral-700">
          Deleting your account removes watchlists, alerts, wishlist items, collection data, push tokens, and your authentication profile. Local app storage will also be cleared on this device.
        </Text>
      </View>

      <View className="gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">
          Confirm with your email
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          Type <Text className="font-semibold text-neutral-700 dark:text-neutral-100">{user.email}</Text> to continue.
        </Text>
        <TextInput
          value={confirmEmail}
          onChangeText={setConfirmEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="your@email.com"
          placeholderTextColor={colors.neutral[400]}
          className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </View>

      <Pressable
        className={`items-center rounded-lg px-5 py-3 ${emailMatches ? 'bg-red-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
        disabled={!emailMatches || deleteAccount.isPending}
        onPress={() => void handleDeleteAccount()}
      >
        <Text className="text-base font-semibold text-white">
          {deleteAccount.isPending ? 'Deleting account…' : 'Delete account permanently'}
        </Text>
      </Pressable>
    </SettingsScreenLayout>
  );
}
