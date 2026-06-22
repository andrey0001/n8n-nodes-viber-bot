/* eslint-disable */
import { ViberBotTrigger } from '../nodes/ViberBot/ViberBotTrigger.node';

describe('ViberBotTrigger Node', () => {
	let triggerNode: ViberBotTrigger;

	beforeEach(() => {
		triggerNode = new ViberBotTrigger();
	});

	it('should have correct trigger metadata', () => {
		expect(triggerNode.description.name).toBe('viberBotTrigger');
		expect(triggerNode.description.displayName).toBe('Viber Bot Trigger');
		expect(triggerNode.description.webhooks).toHaveLength(1);
	});

	it('should register a webhook on create successfully and strip trailing slash', async () => {
		const mockContext: any = {
			getNodeWebhookUrl: jest.fn().mockReturnValue('https://n8n.test/webhook/some-uuid/'),
			getNodeParameter: jest.fn().mockImplementation((paramNameValue: string) => {
				if (paramNameValue === 'eventTypes') return ['delivered', 'seen'];
				return undefined;
			}),
			getNode: jest.fn(),
			helpers: {
				httpRequestWithAuthentication: jest.fn().mockResolvedValue({ status: 0, status_message: 'ok' }),
			},
		};

		const result = await triggerNode.webhookMethods.default.create.call(mockContext);

		expect(result).toBe(true);
		expect(mockContext.helpers.httpRequestWithAuthentication).toHaveBeenCalledTimes(1);
		expect(mockContext.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith('viberBotApi', {
			method: 'POST',
			url: 'https://chatapi.viber.com/pa/set_webhook',
			body: {
				url: 'https://n8n.test/webhook/some-uuid', // Suffix must be stripped!
				event_types: ['delivered', 'seen'],
			},
			json: true,
		});
	});

	it('should throw an error on create if Viber returns a non-zero status', async () => {
		const mockContext: any = {
			getNodeWebhookUrl: jest.fn().mockReturnValue('https://n8n.test/webhook/some-uuid/'),
			getNodeParameter: jest.fn().mockImplementation((paramNameValue: string) => {
				if (paramNameValue === 'eventTypes') return ['delivered', 'seen'];
				return undefined;
			}),
			getNode: jest.fn().mockReturnValue({ name: 'viberBotTrigger' }),
			helpers: {
				httpRequestWithAuthentication: jest.fn().mockResolvedValue({ status: 1, status_message: 'invalidUrl' }),
			},
		};

		await expect(triggerNode.webhookMethods.default.create.call(mockContext)).rejects.toThrow('Viber API registration failed: invalidUrl');
	});

	it('should delete a webhook on delete successfully', async () => {
		const mockContext: any = {
			getNode: jest.fn(),
			helpers: {
				httpRequestWithAuthentication: jest.fn().mockResolvedValue({ status: 0, status_message: 'ok' }),
			},
		};

		const result = await triggerNode.webhookMethods.default.delete.call(mockContext);

		expect(result).toBe(true);
	});

	it('should throw an error on delete if Viber returns a non-zero status', async () => {
		const mockContext: any = {
			getNode: jest.fn().mockReturnValue({ name: 'viberBotTrigger' }),
			helpers: {
				httpRequestWithAuthentication: jest.fn().mockResolvedValue({ status: 2, status_message: 'invalidAuthToken' }),
			},
		};

		await expect(triggerNode.webhookMethods.default.delete.call(mockContext)).rejects.toThrow('Viber API webhook de-registration failed: invalidAuthToken');
	});

	it('should handle incoming standard events successfully', async () => {
		const mockBody = {
			event: 'message',
			timestamp: 1457764197962,
			message_token: 49123456789,
			sender: { id: 'user-1' },
			message: { type: 'text', text: 'Hello!' },
		};

		const mockContext: any = {
			getBodyData: jest.fn().mockReturnValue(mockBody),
			helpers: {
				returnJsonArray: jest.fn().mockImplementation((val) => [val]),
			},
		};

		const result = await triggerNode.webhook.call(mockContext);

		expect(result).toBeDefined();
		expect(result.workflowData).toBeDefined();
		expect(result.workflowData![0][0]).toEqual(mockBody);
	});

	it('should filter out incoming handshake webhook event', async () => {
		const mockBody = {
			event: 'webhook',
			timestamp: 1457764197962,
			message_token: 49123456789,
		};

		const mockContext: any = {
			getBodyData: jest.fn().mockReturnValue(mockBody),
		};

		const result = await triggerNode.webhook.call(mockContext);

		expect(result).toBeDefined();
		expect(result.webhookResponse).toBe('ok');
		expect(result.workflowData).toBeUndefined();
	});
});
