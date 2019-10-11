import React from 'react';
import {
	createAppContainer, createSwitchNavigator, NavigationActions, StackActions
} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { Provider } from 'react-redux';
import { useScreens } from 'react-native-screens'; // eslint-disable-line import/no-unresolved
import { Linking, View } from 'react-native';
import PropTypes from 'prop-types';

// import SplitViewApp from './tablet';
import { appInit } from './actions';
import { deepLinkingOpen } from './actions/deepLinking';
import Navigation from './lib/Navigation';
import Sidebar from './views/SidebarView';
import parseQuery from './lib/methods/helpers/parseQuery';
import { initializePushNotifications, onNotification } from './notifications/push';
import store from './lib/createStore';
import NotificationBadge from './notifications/inApp';
import { defaultHeader, onNavigationStateChange } from './utils/navigation';
import { loggerConfig, analytics } from './utils/log';
import Toast from './containers/Toast';
import RocketChat from './lib/rocketchat';
import LayoutAnimation from './utils/layoutAnimation';
import { COLOR_BORDER } from './constants/colors';
import { isTablet } from './utils/deviceInfo';
// import { isTablet } from './utils/deviceInfo';

useScreens();

let showModal = false;

const parseDeepLinking = (url) => {
	if (url) {
		url = url.replace(/rocketchat:\/\/|https:\/\/go.rocket.chat\//, '');
		const regex = /^(room|auth)\?/;
		if (url.match(regex)) {
			url = url.replace(regex, '').trim();
			if (url) {
				return parseQuery(url);
			}
		}
	}
	return null;
};

// Outside
const OutsideStack = createStackNavigator({
	OnboardingView: {
		getScreen: () => require('./views/OnboardingView').default,
		header: null
	},
	NewServerView: {
		getScreen: () => require('./views/NewServerView').default
	},
	LoginSignupView: {
		getScreen: () => require('./views/LoginSignupView').default
	},
	LoginView: {
		getScreen: () => require('./views/LoginView').default
	},
	ForgotPasswordView: {
		getScreen: () => require('./views/ForgotPasswordView').default
	},
	RegisterView: {
		getScreen: () => require('./views/RegisterView').default
	},
	LegalView: {
		getScreen: () => require('./views/LegalView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const AuthenticationWebViewStack = createStackNavigator({
	AuthenticationWebView: {
		getScreen: () => require('./views/AuthenticationWebView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const OutsideStackModal = createStackNavigator({
	OutsideStack,
	AuthenticationWebViewStack
},
{
	mode: 'modal',
	headerMode: 'none'
});

// Inside
const ChatsStack = createStackNavigator({
	RoomsListView: {
		getScreen: () => require('./views/RoomsListView').default
	},
	RoomView: {
		getScreen: () => require('./views/RoomView').default
	},
	RoomActionsView: {
		getScreen: () => require('./views/RoomActionsView').default
	},
	RoomInfoView: {
		getScreen: () => require('./views/RoomInfoView').default
	},
	RoomInfoEditView: {
		getScreen: () => require('./views/RoomInfoEditView').default
	},
	RoomMembersView: {
		getScreen: () => require('./views/RoomMembersView').default
	},
	SearchMessagesView: {
		getScreen: () => require('./views/SearchMessagesView').default
	},
	SelectedUsersView: {
		getScreen: () => require('./views/SelectedUsersView').default
	},
	ThreadMessagesView: {
		getScreen: () => require('./views/ThreadMessagesView').default
	},
	MessagesView: {
		getScreen: () => require('./views/MessagesView').default
	},
	AutoTranslateView: {
		getScreen: () => require('./views/AutoTranslateView').default
	},
	ReadReceiptsView: {
		getScreen: () => require('./views/ReadReceiptView').default
	},
	DirectoryView: {
		getScreen: () => require('./views/DirectoryView').default
	},
	TableView: {
		getScreen: () => require('./views/TableView').default
	},
	NotificationPrefView: {
		getScreen: () => require('./views/NotificationPreferencesView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

// Inside
const RoomStack = createStackNavigator({
	RoomView: {
		getScreen: () => require('./views/RoomView').default
	},
	ThreadMessagesView: {
		getScreen: () => require('./views/ThreadMessagesView').default
	},
	TableView: {
		getScreen: () => require('./views/TableView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

ChatsStack.navigationOptions = ({ navigation }) => {
	let drawerLockMode = 'unlocked';
	if (navigation.state.index > 0) {
		drawerLockMode = 'locked-closed';
	}
	return {
		drawerLockMode
	};
};

const ProfileStack = createStackNavigator({
	ProfileView: {
		getScreen: () => require('./views/ProfileView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

ProfileStack.navigationOptions = ({ navigation }) => {
	let drawerLockMode = 'unlocked';
	if (navigation.state.index > 0) {
		drawerLockMode = 'locked-closed';
	}
	return {
		drawerLockMode
	};
};

const SettingsStack = createStackNavigator({
	SettingsView: {
		getScreen: () => require('./views/SettingsView').default
	},
	LanguageView: {
		getScreen: () => require('./views/LanguageView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const AdminPanelStack = createStackNavigator({
	AdminPanelView: {
		getScreen: () => require('./views/AdminPanelView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

SettingsStack.navigationOptions = ({ navigation }) => {
	let drawerLockMode = 'unlocked';
	if (navigation.state.index > 0) {
		drawerLockMode = 'locked-closed';
	}
	return {
		drawerLockMode
	};
};

const ChatsDrawer = createDrawerNavigator({
	ChatsStack,
	ProfileStack,
	SettingsStack,
	AdminPanelStack
}, {
	contentComponent: Sidebar,
	overlayColor: '#00000090'
});

const NewMessageStack = createStackNavigator({
	NewMessageView: {
		getScreen: () => require('./views/NewMessageView').default
	},
	SelectedUsersViewCreateChannel: {
		getScreen: () => require('./views/SelectedUsersView').default
	},
	CreateChannelView: {
		getScreen: () => require('./views/CreateChannelView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const InsideStackModal = createStackNavigator({
	Main: ChatsDrawer,
	NewMessageStack,
	JitsiMeetView: {
		getScreen: () => require('./views/JitsiMeetView').default
	}
},
{
	mode: 'modal',
	headerMode: 'none'
});

const SetUsernameStack = createStackNavigator({
	SetUsernameView: {
		getScreen: () => require('./views/SetUsernameView').default
	}
});

class CustomInsideStack extends React.Component {
	static router = InsideStackModal.router;

	static propTypes = {
		navigation: PropTypes.object
	}

	render() {
		const { navigation } = this.props;
		return (
			<>
				<InsideStackModal navigation={navigation} />
				<NotificationBadge navigation={navigation} />
				<Toast />
			</>
		);
	}
}

const MessagesStack = createStackNavigator({
	NewMessageView: {
		getScreen: () => require('./views/NewMessageView').default
	},
	SelectedUsersViewCreateChannel: {
		getScreen: () => require('./views/SelectedUsersView').default
	},
	CreateChannelView: {
		getScreen: () => require('./views/CreateChannelView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const DirectoryStack = createStackNavigator({
	DirectoryView: {
		getScreen: () => require('./views/DirectoryView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const SidebarStack = createStackNavigator({
	SidebarView: {
		getScreen: () => require('./views/SidebarView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const RoomActionsStack = createStackNavigator({
	RoomActionsView: {
		getScreen: () => require('./views/RoomActionsView').default
	},
	RoomInfoView: {
		getScreen: () => require('./views/RoomInfoView').default
	},
	RoomInfoEditView: {
		getScreen: () => require('./views/RoomInfoEditView').default
	},
	RoomMembersView: {
		getScreen: () => require('./views/RoomMembersView').default
	},
	SearchMessagesView: {
		getScreen: () => require('./views/SearchMessagesView').default
	},
	SelectedUsersView: {
		getScreen: () => require('./views/SelectedUsersView').default
	},
	MessagesView: {
		getScreen: () => require('./views/MessagesView').default
	},
	AutoTranslateView: {
		getScreen: () => require('./views/AutoTranslateView').default
	},
	ReadReceiptsView: {
		getScreen: () => require('./views/ReadReceiptView').default
	},
	NotificationPrefView: {
		getScreen: () => require('./views/NotificationPreferencesView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});


const ModalSwitch = createSwitchNavigator({
	MessagesStack,
	DirectoryStack,
	SidebarStack,
	RoomActionsStack,
	ProfileStack,
	SettingsStack,
	AdminPanelStack,
	AuthLoading: () => null
},
{
	initialRouteName: 'AuthLoading'
});

class CustomModalStack extends React.Component {
	static router = ModalSwitch.router;

	static propTypes = {
		navigation: PropTypes.object
	}

	render() {
		const { navigation } = this.props;
		if (!showModal) { return null; }
		return (
			<View
				style={{
					flex: 1,
					width: '100%',
					height: '100%',
					backgroundColor: '#00000030',
					position: 'absolute',
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<View
					style={{
						width: '70%',
						height: '70%',
						overflow: 'hidden',
						borderRadius: 16,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.8,
						shadowRadius: 2,
						elevation: 1
					}}
				>
					<ModalSwitch navigation={navigation} />
				</View>
			</View>
		);
	}
}

const App = createAppContainer(createSwitchNavigator(
	{
		OutsideStack: OutsideStackModal,
		InsideStack: CustomInsideStack,
		AuthLoading: {
			getScreen: () => require('./views/AuthLoadingView').default
		},
		SetUsernameStack
	},
	{
		initialRouteName: 'AuthLoading'
	}
));

const RoomContainer = createAppContainer(RoomStack);

const ModalContainer = createAppContainer(CustomModalStack);

export default class Root extends React.Component {
	constructor(props) {
		super(props);
		this.init();
		this.initCrashReport();
	}

	componentDidMount() {
		this.listenerTimeout = setTimeout(() => {
			Linking.addEventListener('url', ({ url }) => {
				const parsedDeepLinkingURL = parseDeepLinking(url);
				if (parsedDeepLinkingURL) {
					store.dispatch(deepLinkingOpen(parsedDeepLinkingURL));
				}
			});
		}, 5000);

		const defaultApp = App.router.getStateForAction;
		const defaultModal = ModalContainer.router.getStateForAction;
		const defaultRoom = RoomContainer.router.getStateForAction;

		RoomContainer.router.getStateForAction = (action, state) => {
			if (action.type === NavigationActions.NAVIGATE && isTablet) {
				const { routeName, params } = action;
				if (routeName === 'RoomActionsView') {
					this.modalRef.dispatch(NavigationActions.navigate({ routeName, params }));
					showModal = true;
					return null;
				}
			}
			return defaultRoom(action, state);
		};

		ModalContainer.router.getStateForAction = (action, state) => {
			if (action.type === 'Navigation/POP' && isTablet) {
				this.modalRef.dispatch(NavigationActions.navigate({ routeName: 'AuthLoading' }));
				showModal = false;
				action.params = action.params || this.params;
			}
			return defaultModal(action, state);
		};

		App.router.getStateForAction = (action, state) => {
			if (action.type === NavigationActions.NAVIGATE && isTablet) {
				const { routeName, params } = action;
				if (routeName === 'RoomView') {
					const resetAction = StackActions.reset({
						index: 0,
						actions: [NavigationActions.navigate({ routeName, params })]
					});
					this.roomRef.dispatch(resetAction);
					return null;
				}

				if (routeName === 'NewMessageView') {
					this.modalRef.dispatch(NavigationActions.navigate({ routeName }));
					showModal = true;
					this.params = params;
					return null;
				}
				if (routeName === 'DirectoryView') {
					this.modalRef.dispatch(NavigationActions.navigate({ routeName }));
					showModal = true;
					return null;
				}
			}
			if (action.type === 'Navigation/TOGGLE_DRAWER' && isTablet) {
				this.modalRef.dispatch(NavigationActions.navigate({ routeName: 'SettingsView' }));
				showModal = true;
				return null;
			}
			return defaultApp(action, state);
		};
	}

	componentWillUnmount() {
		clearTimeout(this.listenerTimeout);
	}

	init = async() => {
		const [notification, deepLinking] = await Promise.all([initializePushNotifications(), Linking.getInitialURL()]);
		const parsedDeepLinkingURL = parseDeepLinking(deepLinking);
		if (notification) {
			onNotification(notification);
		} else if (parsedDeepLinkingURL) {
			store.dispatch(deepLinkingOpen(parsedDeepLinkingURL));
		} else {
			store.dispatch(appInit());
		}
	}

	initCrashReport = () => {
		RocketChat.getAllowCrashReport()
			.then((allowCrashReport) => {
				if (!allowCrashReport) {
					loggerConfig.autoNotify = false;
					loggerConfig.registerBeforeSendCallback(() => false);
					analytics().setAnalyticsCollectionEnabled(false);
				}
			});
	}

	renderRight = () => (
		<>
			<View style={{ height: '100%', width: 1, backgroundColor: COLOR_BORDER }} />
			<View style={{ flex: 17 }}>
				<RoomContainer
					ref={(roomRef) => {
						this.roomRef = roomRef;
					}}
				/>
			</View>
		</>
	)

	render() {
		return (
			<Provider store={store}>
				<LayoutAnimation>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<View style={{ flex: 8 }}>
							<App
								ref={(navigatorRef) => {
									Navigation.setTopLevelNavigator(navigatorRef);
								}}
								onNavigationStateChange={onNavigationStateChange}
							/>
						</View>
						{ isTablet ? this.renderRight() : null }
						<ModalContainer
							ref={(modalRef) => {
								this.modalRef = modalRef;
							}}
						/>
					</View>
				</LayoutAnimation>
			</Provider>
		);
	}
}
