import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class ViberBotApi implements ICredentialType {
	name = 'viberBotApi';
	displayName = 'Viber Bot API';
	icon: Icon = 'file:viber.svg';
	documentationUrl = 'https://developers.viber.com/docs/api/rest-bot-api/#authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'Auth Token',
			name: 'authToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The authentication token for your Viber Bot',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Viber-Auth-Token': '={{$credentials.authToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://chatapi.viber.com/pa',
			url: '/get_account_info',
			method: 'POST',
			body: {},
		},
	};
}
