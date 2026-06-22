import {
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

export class ViberBotTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Viber Bot Trigger',
		name: 'viberBotTrigger',
		icon: 'file:viber.svg',
		group: ['trigger'],
		version: 1,
		subtitle: 'Listen for Viber events',
		description: 'Starts the workflow when Viber Bot events occur',
		usableAsTool: true,
		defaults: {
			name: 'Viber Bot Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'viberBotApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: '={{$workflow.id}}',
				isFullPath: true,
			},
		],
		properties: [
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				options: [
					{ name: 'Conversation Started', value: 'conversation_started' },
					{ name: 'Delivered', value: 'delivered' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Seen', value: 'seen' },
					{ name: 'Subscribed', value: 'subscribed' },
					{ name: 'Unsubscribed', value: 'unsubscribed' },
				],
				default: ['conversation_started', 'delivered', 'failed', 'seen', 'subscribed', 'unsubscribed'],
				description: 'The events to subscribe to',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const eventTypes = this.getNodeParameter('eventTypes') as string[];

				const body: IDataObject = {
					url: webhookUrl,
					event_types: eventTypes,
				};

				try {
					const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'viberBotApi', {
						method: 'POST',
						url: 'https://chatapi.viber.com/pa/set_webhook',
						body,
						json: true,
					}) as IDataObject;

					if (responseData && responseData.status !== 0) {
						throw new NodeOperationError(this.getNode(), `Viber API registration failed: ${responseData.status_message} (status: ${responseData.status}). Please ensure your n8n WEBHOOK_URL is using HTTPS and is accessible over the internet.`);
					}
				} catch (error) {
					throw new NodeOperationError(this.getNode(), error as Error);
				}

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				try {
					const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'viberBotApi', {
						method: 'POST',
						url: 'https://chatapi.viber.com/pa/set_webhook',
						body: {
							url: '',
						},
						json: true,
					}) as IDataObject;

					if (responseData && responseData.status !== 0) {
						throw new NodeOperationError(this.getNode(), `Viber API webhook de-registration failed: ${responseData.status_message} (status: ${responseData.status}).`);
					}
				} catch (error) {
					throw new NodeOperationError(this.getNode(), error as Error);
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;

		// When registering a webhook, Viber sends a handshake payload of type "webhook" to test connection.
		// We respond with HTTP 200 OK without executing the workflow.
		if (body.event === 'webhook') {
			return {
				webhookResponse: 'ok',
			};
		}

		return {
			workflowData: [
				this.helpers.returnJsonArray(body),
			],
		};
	}
}
