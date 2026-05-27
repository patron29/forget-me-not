import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Minimal navigation param list for the root stack. The app uses a bottom-tab
 * navigator nested under `Main`, plus the modal/detail screens below. None of
 * these routes take params yet, so each is typed `undefined`.
 */
export type RootStackParamList = {
  Main: undefined;
  Paywall: undefined;
  Terms: undefined;
  Privacy: undefined;
};

/** Screen props helper for any screen mounted in the root stack. */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
