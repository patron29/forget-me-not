import React from 'react';
import { renderWithProviders as render, fireEvent } from '../src/test-utils';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import VoiceInput from '../src/components/VoiceInput';

describe('VoiceInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a voice input button', () => {
    const { getByLabelText } = render(
      <VoiceInput onVoiceResult={jest.fn()} />
    );
    expect(getByLabelText('Start voice input')).toBeTruthy();
  });

  it('requests permission and starts recognition on press', async () => {
    const { getByLabelText } = render(
      <VoiceInput onVoiceResult={jest.fn()} />
    );

    await fireEvent.press(getByLabelText('Start voice input'));

    expect(
      ExpoSpeechRecognitionModule.requestPermissionsAsync
    ).toHaveBeenCalled();
  });

  it('does not start recognition when permission is denied', async () => {
    ExpoSpeechRecognitionModule.requestPermissionsAsync.mockResolvedValueOnce({
      granted: false,
    });

    const { getByLabelText } = render(
      <VoiceInput onVoiceResult={jest.fn()} />
    );

    await fireEvent.press(getByLabelText('Start voice input'));

    expect(ExpoSpeechRecognitionModule.start).not.toHaveBeenCalled();
  });
});
