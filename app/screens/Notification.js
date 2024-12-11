import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, TextInput } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as MailComposer from 'expo-mail-composer';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notificationTime, setNotificationTime] = useState(0);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const schedulePushNotification = async () => {
    const trigger = notificationTime > 0 ? { seconds: notificationTime } : null;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { data: 'goes here' },
      },
      trigger,
    });
  };

  const sendNotificationByEmail = () => {
    MailComposer.composeAsync({
      recipients: ['recipient@example.com'],
      subject: title,
      body: body,
    });
  };

  return (
    <View
      style={{
        flex: 1,
        // alignItems: 'center',
        justifyContent: 'space-around',
        padding: 5,
      }}>
      {/* <Text>Your expo push token: {expoPushToken}</Text> */}
      <View>
        <TextInput
          placeholder="Notification Title"
          value={title}
          onChangeText={text => setTitle(text)}
          style={{
            borderWidth: 1,
            borderColor: 'gray',
            marginBottom: 8,
            padding: 8,
            width: 200,
          }}
        />
        <TextInput
          placeholder="Notification Body"
          value={body}
          onChangeText={text => setBody(text)}
          style={{
            borderWidth: 1,
            borderColor: 'gray',
            marginBottom: 8,
            padding: 8,
            width: 200,
          }}
        />
        <TextInput
          placeholder="Notification Time (in seconds)"
          value={notificationTime.toString()}
          onChangeText={text => setNotificationTime(parseInt(text) || 0)}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: 'gray',
            marginBottom: 8,
            padding: 8,
            width: 200,
          }}
        />
        <Button
          title="Schedule Notification"
          onPress={schedulePushNotification}
        />
      </View>
      {notification && (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text>Title: {notification.request.content.title} </Text>
          <Text>Body: {notification.request.content.body}</Text>
          <Text>Data: {JSON.stringify(notification.request.content.data)}</Text>
        </View>
      )}
      {/* <Button
        title="Send Notification via Email"
        onPress={sendNotificationByEmail}
      /> */}
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId: 'ad3982df-2a0f-4f45-8b86-c87e219f9d7d' })).data;
  } else {
    alert('Must use a physical device for Push Notifications');
  }

  return token;
}