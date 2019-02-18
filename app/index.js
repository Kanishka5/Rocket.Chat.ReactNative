import { Component } from 'react';
import { Linking } from 'react-native';

import { appInit } from './actions';
import { deepLinkingOpen } from './actions/deepLinking';
import store from './lib/createStore';
import Icons from './lib/Icons';
import Navigation from './lib/Navigation';
import parseQuery from './lib/methods/helpers/parseQuery';
import { initializePushNotifications } from './push';
import { DEFAULT_HEADER } from './constants/headerOptions';
import { serverDatabase, appDatabase } from './lib/database';

const startLogged = async() => {
	Navigation.loadView('ProfileView');
	Navigation.loadView('RoomsListHeaderView');
	Navigation.loadView('RoomsListView');
	Navigation.loadView('RoomView');
	Navigation.loadView('RoomHeaderView');
	Navigation.loadView('SettingsView');
	Navigation.loadView('SidebarView');
	Navigation.setRoot({
		root: {
			sideMenu: {
				left: {
					component: {
						id: 'SidebarView',
						name: 'SidebarView'
					}
				},
				center: {
					stack: {
						id: 'AppRoot',
						children: [{
							component: {
								id: 'RoomsListView',
								name: 'RoomsListView'
							}
						}]
					}
				}
			}
		}
	});

	// const serversCollection = serverDatabase.collections.get('servers');
	// const servers = await serversCollection.query().fetch();
	// console.log('TCL: startNotLogged -> servers', servers);

	// const settingsCollection = appDatabase.collections.get('settings');
	// const settings = await settingsCollection.query().fetch();
	// console.log('TCL: startNotLogged -> settings', settings);

	const permissionsCollection = appDatabase.collections.get('permissions');
	const permissions = await permissionsCollection.query().fetch();
	console.log('TCL: startNotLogged -> permissions', permissions);

	const p = permissions[0];
	console.log(p.roles)

	// const rolesCollection = appDatabase.collections.get('roles');
	// const roles = await rolesCollection.query().fetch();
	// console.log('TCL: startNotLogged -> roles', roles);
};

const startNotLogged = () => {
	Navigation.loadView('OnboardingView');
	Navigation.setRoot({
		root: {
			stack: {
				children: [{
					component: {
						name: 'OnboardingView'
					}
				}],
				options: {
					layout: {
						orientation: ['portrait']
					}
				}
			}
		}
	});
};

const startSetUsername = () => {
	Navigation.loadView('SetUsernameView');
	Navigation.setRoot({
		root: {
			stack: {
				children: [{
					component: {
						name: 'SetUsernameView'
					}
				}],
				options: {
					layout: {
						orientation: ['portrait']
					}
				}
			}
		}
	});
};

const handleOpenURL = ({ url }) => {
	if (url) {
		url = url.replace(/rocketchat:\/\/|https:\/\/go.rocket.chat\//, '');
		const regex = /^(room|auth)\?/;
		if (url.match(regex)) {
			url = url.replace(regex, '');
			const params = parseQuery(url);
			store.dispatch(deepLinkingOpen(params));
		}
	}
};

Icons.configure();

export default class App extends Component {
	constructor(props) {
		super(props);
		initializePushNotifications();

		Navigation.events().registerAppLaunchedListener(() => {
			Navigation.setDefaultOptions({
				...DEFAULT_HEADER,
				sideMenu: {
					left: {
						enabled: false
					},
					right: {
						enabled: false
					}
				}
			});
			store.dispatch(appInit());
			store.subscribe(this.onStoreUpdate.bind(this));
		});
		Linking
			.getInitialURL()
			.then(url => handleOpenURL({ url }))
			.catch(e => console.warn(e));
		Linking.addEventListener('url', handleOpenURL);
	}

	onStoreUpdate = () => {
		const { root } = store.getState().app;

		if (this.currentRoot !== root) {
			this.currentRoot = root;
			if (root === 'outside') {
				startNotLogged();
			} else if (root === 'inside') {
				startLogged();
			} else if (root === 'setUsername') {
				startSetUsername();
			}
		}
	}

	setDeviceToken(deviceToken) {
		this.deviceToken = deviceToken;
	}
}
