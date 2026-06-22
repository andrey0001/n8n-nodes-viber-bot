import { ViberBot } from '../nodes/ViberBot/ViberBot.node';
import { createMockExecuteFunctions } from './mocks/mockExecuteFunctions';

describe('ViberBot Node', () => {
	let node: ViberBot;

	beforeEach(() => {
		node = new ViberBot();
	});

	it('should have the correct node description metadata', () => {
		expect(node.description.displayName).toBe('Viber Bot');
		expect(node.description.name).toBe('viberBot');
		expect(node.description.credentials).toEqual([
			{
				name: 'viberBotApi',
				required: true,
			},
		]);
	});

	it('should send a text message successfully', async () => {
		const mockResponse = {
			status: 0,
			status_message: 'ok',
			message_token: 49123456789,
		};

		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'message',
				operation: 'send',
				receiver: 'user-viber-id-123',
				messageType: 'text',
				text: 'Hello from n8n Viber Bot!',
				additionalFields: {
					senderName: 'TestBot',
					senderAvatar: 'https://example.com/avatar.png',
					trackingData: 'track_123',
				},
			},
			httpRequestResponse: mockResponse,
		});

		const result = await node.execute.call(mockExecuteFunctions);

		expect(result).toBeDefined();
		expect(result[0]).toHaveLength(1);
		expect(result[0][0].json).toEqual(mockResponse);

		const mockCall = mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock;
		expect(mockCall).toHaveBeenCalledTimes(1);
		const [credentialName, requestOptions] = mockCall.mock.calls[0];

		expect(credentialName).toBe('viberBotApi');
		expect(requestOptions.method).toBe('POST');
		expect(requestOptions.url).toBe('https://chatapi.viber.com/pa/send_message');
		expect(requestOptions.body).toEqual({
			type: 'text',
			receiver: 'user-viber-id-123',
			text: 'Hello from n8n Viber Bot!',
			sender: {
				name: 'TestBot',
				avatar: 'https://example.com/avatar.png',
			},
			tracking_data: 'track_123',
		});
	});

	it('should send a picture message successfully', async () => {
		const mockResponse = { status: 0, status_message: 'ok' };

		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'message',
				operation: 'send',
				receiver: 'user-viber-id-123',
				messageType: 'picture',
				media: 'https://example.com/image.jpg',
				caption: 'Beautiful landscape',
				thumbnail: 'https://example.com/thumb.jpg',
			},
			httpRequestResponse: mockResponse,
		});

		const result = await node.execute.call(mockExecuteFunctions);

		expect(result[0][0].json).toEqual(mockResponse);

		const mockCall = mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock;
		const [, requestOptions] = mockCall.mock.calls[0];

		expect(requestOptions.url).toBe('https://chatapi.viber.com/pa/send_message');
		expect(requestOptions.body).toEqual({
			type: 'picture',
			receiver: 'user-viber-id-123',
			media: 'https://example.com/image.jpg',
			text: 'Beautiful landscape',
			thumbnail: 'https://example.com/thumb.jpg',
		});
	});

	it('should broadcast a file message successfully', async () => {
		const mockResponse = { status: 0, status_message: 'ok', failed_list: [] };

		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'message',
				operation: 'broadcast',
				broadcastList: 'user-1,user-2,user-3',
				messageType: 'file',
				media: 'https://example.com/doc.pdf',
				size: 1048576,
				fileName: 'document.pdf',
			},
			httpRequestResponse: mockResponse,
		});

		const result = await node.execute.call(mockExecuteFunctions);

		expect(result[0][0].json).toEqual(mockResponse);

		const mockCall = mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock;
		const [, requestOptions] = mockCall.mock.calls[0];

		expect(requestOptions.url).toBe('https://chatapi.viber.com/pa/broadcast_message');
		expect(requestOptions.body).toEqual({
			type: 'file',
			broadcast_list: ['user-1', 'user-2', 'user-3'],
			media: 'https://example.com/doc.pdf',
			size: 1048576,
			file_name: 'document.pdf',
		});
	});

	it('should register a webhook successfully', async () => {
		const mockResponse = {
			status: 0,
			status_message: 'ok',
			event_types: ['delivered', 'seen'],
		};

		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'webhook',
				operation: 'set',
				url: 'https://n8n-instance.com/webhook/viber',
				eventTypes: ['delivered', 'seen'],
				additionalFields: {
					sendName: true,
					sendPhoto: false,
				},
			},
			httpRequestResponse: mockResponse,
		});

		const result = await node.execute.call(mockExecuteFunctions);

		expect(result[0][0].json).toEqual(mockResponse);

		const mockCall = mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock;
		const [, requestOptions] = mockCall.mock.calls[0];

		expect(requestOptions.url).toBe('https://chatapi.viber.com/pa/set_webhook');
		expect(requestOptions.body).toEqual({
			url: 'https://n8n-instance.com/webhook/viber',
			event_types: ['delivered', 'seen'],
			send_name: true,
			send_photo: false,
		});
	});

	it('should fetch account information successfully', async () => {
		const mockResponse = {
			status: 0,
			name: 'My Viber Bot',
			uri: 'myviberbot',
		};

		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'account',
				operation: 'get',
			},
			httpRequestResponse: mockResponse,
		});

		const result = await node.execute.call(mockExecuteFunctions);

		expect(result[0][0].json).toEqual(mockResponse);

		const mockCall = mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock;
		const [, requestOptions] = mockCall.mock.calls[0];

		expect(requestOptions.url).toBe('https://chatapi.viber.com/pa/get_account_info');
		expect(requestOptions.body).toEqual({});
	});

	it('should fetch user details successfully', async () => {
		const mockResponse = {
			status: 0,
			user: {
				name: 'John Doe',
				country: 'US',
			},
		};

		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'user',
				operation: 'get',
				userId: 'user-id-456',
			},
			httpRequestResponse: mockResponse,
		});

		const result = await node.execute.call(mockExecuteFunctions);

		expect(result[0][0].json).toEqual(mockResponse);

		const mockCall = mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock;
		const [, requestOptions] = mockCall.mock.calls[0];

		expect(requestOptions.url).toBe('https://chatapi.viber.com/pa/get_user_details');
		expect(requestOptions.body).toEqual({
			id: 'user-id-456',
		});
	});

	it('should send a rich media carousel message successfully', async () => {
		const mockResponse = { status: 0, status_message: 'ok' };
		const richMediaObj = {
			Type: 'rich_media',
			ButtonsGroupColumns: 6,
			ButtonsGroupRows: 7,
			Buttons: [{ ActionType: 'reply', ActionBody: 'click', Text: 'Click Me' }],
		};

		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'message',
				operation: 'send',
				receiver: 'user-viber-id-123',
				messageType: 'rich_media',
				richMedia: JSON.stringify(richMediaObj),
				additionalFields: {
					minApiVersion: 7,
				},
			},
			httpRequestResponse: mockResponse,
		});

		const result = await node.execute.call(mockExecuteFunctions);

		expect(result[0][0].json).toEqual(mockResponse);

		const mockCall = mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock;
		const [, requestOptions] = mockCall.mock.calls[0];

		expect(requestOptions.body).toEqual({
			type: 'rich_media',
			receiver: 'user-viber-id-123',
			min_api_version: 7,
			rich_media: richMediaObj,
		});
	});

	it('should throw an error for invalid rich media JSON', async () => {
		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'message',
				operation: 'send',
				receiver: 'user-viber-id-123',
				messageType: 'rich_media',
				richMedia: '{ invalid-json }',
			},
		});

		await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Invalid Rich Media JSON');
	});

	it('should attach a keyboard JSON to a text message successfully', async () => {
		const mockResponse = { status: 0, status_message: 'ok' };
		const keyboardObj = {
			Type: 'keyboard',
			Buttons: [{ ActionType: 'reply', ActionBody: 'reply1', Text: 'Reply 1' }],
		};

		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'message',
				operation: 'send',
				receiver: 'user-viber-id-123',
				messageType: 'text',
				text: 'Choose an option:',
				additionalFields: {
					keyboard: JSON.stringify(keyboardObj),
					minApiVersion: 7,
				},
			},
			httpRequestResponse: mockResponse,
		});

		const result = await node.execute.call(mockExecuteFunctions);

		expect(result[0][0].json).toEqual(mockResponse);

		const mockCall = mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock;
		const [, requestOptions] = mockCall.mock.calls[0];

		expect(requestOptions.body).toEqual({
			type: 'text',
			receiver: 'user-viber-id-123',
			text: 'Choose an option:',
			keyboard: keyboardObj,
			min_api_version: 7,
		});
	});

	it('should throw an error for invalid keyboard JSON', async () => {
		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'message',
				operation: 'send',
				receiver: 'user-viber-id-123',
				messageType: 'text',
				text: 'Hello',
				additionalFields: {
					keyboard: '{ bad-json }',
				},
			},
		});

		await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Invalid Viber Keyboard JSON');
	});

	it('should continue on fail if continueOnFail is true', async () => {
		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'account',
				operation: 'get',
			},
			continueOnFail: true,
		});

		// Force the HTTP client to fail
		const mockCall = mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock;
		mockCall.mockRejectedValue(new Error('Network error'));

		const result = await node.execute.call(mockExecuteFunctions);

		expect(result[0][0].json).toEqual({
			error: 'Network error',
		});
	});
});
