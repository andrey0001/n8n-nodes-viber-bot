import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

export class ViberBot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Viber Bot',
		name: 'viberBot',
		icon: 'file:viber.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"]}} + ": " + {{$parameter["operation"]}}',
		description: 'Interact with the Viber Bot REST API',
		usableAsTool: true,
		defaults: {
			name: 'Viber Bot',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'viberBotApi',
				required: true,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Webhook',
						value: 'webhook',
					},
				],
				default: 'message',
			},

			// ==========================================
			// OPERATIONS
			// ==========================================

			// Operations: Message
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						name: 'Broadcast',
						value: 'broadcast',
						description: 'Broadcast a message to multiple subscribed users',
						action: 'Broadcast a message',
					},
					{
						name: 'Send',
						value: 'send',
						description: 'Send a message to a subscribed user',
						action: 'Send a message',
					},
				],
				default: 'send',
			},

			// Operations: Webhook
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
					},
				},
				options: [
					{
						name: 'Set',
						value: 'set',
						description: 'Set a webhook URL for callbacks',
						action: 'Set a webhook',
					},
				],
				default: 'set',
			},

			// Operations: Account
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get Viber Bot account details',
						action: 'Get account details',
					},
				],
				default: 'get',
			},

			// Operations: User
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get details of a specific user',
						action: 'Get user details',
					},
				],
				default: 'get',
			},

			// ==========================================
			// PARAMETERS: WEBHOOK
			// ==========================================

			// Webhook -> Set -> URL
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['set'],
					},
				},
				default: '',
				description: 'The URL for receiving callbacks and user messages',
			},

			// Webhook -> Set -> Event Types
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['set'],
					},
				},
				options: [
					{ name: 'Conversation Started', value: 'conversation_started' },
					{ name: 'Delivered', value: 'delivered' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Seen', value: 'seen' },
					{ name: 'Subscribed', value: 'subscribed' },
					{ name: 'Unsubscribed', value: 'unsubscribed' },
				],
				default: ['delivered', 'seen', 'failed', 'subscribed', 'unsubscribed', 'conversation_started'],
				description: 'The events to subscribe to',
			},

			// Webhook -> Set -> Additional fields
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['set'],
					},
				},
				options: [
					{
						displayName: 'Send Name',
						name: 'sendName',
						type: 'boolean',
						default: true,
						description: 'Whether to send the sender name in callbacks',
					},
					{
						displayName: 'Send Photo',
						name: 'sendPhoto',
						type: 'boolean',
						default: true,
						description: 'Whether to send the sender photo in callbacks',
					},
				],
			},

			// ==========================================
			// PARAMETERS: USER
			// ==========================================

			// User -> Get -> User ID
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The unique Viber user ID',
			},

			// ==========================================
			// PARAMETERS: MESSAGE
			// ==========================================

			// Message -> Send -> Receiver
			{
				displayName: 'Receiver',
				name: 'receiver',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				default: '',
				description: 'The unique Viber user ID of the receiver',
			},

			// Message -> Broadcast -> Broadcast List
			{
				displayName: 'Broadcast List',
				name: 'broadcastList',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['broadcast'],
					},
				},
				default: '',
				description: 'A list of user IDs to receive the message (can be comma-separated or a JSON array of strings)',
			},

			// Message -> Send/Broadcast -> Message Type
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
					},
				},
				options: [
					{ name: 'Contact', value: 'contact' },
					{ name: 'File', value: 'file' },
					{ name: 'Location', value: 'location' },
					{ name: 'Picture', value: 'picture' },
					{ name: 'Sticker', value: 'sticker' },
					{ name: 'Text', value: 'text' },
					{ name: 'URL', value: 'url' },
					{ name: 'Video', value: 'video' },
				],
				default: 'text',
				description: 'The type of message to send',
			},

			// Message -> Send/Broadcast -> Text (for Text type)
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['text'],
					},
				},
				default: '',
				description: 'The text message to send (max 7000 characters)',
			},

			// Message -> Send/Broadcast -> Caption (for Picture)
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['picture'],
					},
				},
				default: '',
				description: 'An optional description of the picture (max 120 characters)',
			},

			// Message -> Send/Broadcast -> Media URL (for Picture, Video, File, URL)
			{
				displayName: 'Media URL',
				name: 'media',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['picture', 'video', 'file', 'url'],
					},
				},
				default: '',
				description: 'The URL of the media file (must be HTTPS)',
			},

			// Message -> Send/Broadcast -> Thumbnail URL (for Picture)
			{
				displayName: 'Thumbnail URL',
				name: 'thumbnail',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['picture'],
					},
				},
				default: '',
				description: 'The URL of the picture thumbnail (must be HTTPS, JPEG/PNG, max 100kb)',
			},

			// Message -> Send/Broadcast -> File Size (for Video, File)
			{
				displayName: 'File Size (Bytes)',
				name: 'size',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['video', 'file'],
					},
				},
				default: 0,
				description: 'The size of the video or file in bytes',
			},

			// Message -> Send/Broadcast -> Video Duration (for Video)
			{
				displayName: 'Video Duration (Seconds)',
				name: 'duration',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['video'],
					},
				},
				default: 0,
				description: 'The duration of the video in seconds (max 600 seconds)',
			},

			// Message -> Send/Broadcast -> File Name (for File)
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['file'],
					},
				},
				default: '',
				description: 'The name of the file (including extension, e.g. document.pdf)',
			},

			// Message -> Send/Broadcast -> Latitude (for Location)
			{
				displayName: 'Latitude',
				name: 'latitude',
				type: 'number',
				typeOptions: {
					numberPrecision: 6,
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['location'],
					},
				},
				default: 0,
				description: 'Latitude of the location',
			},

			// Message -> Send/Broadcast -> Longitude (for Location)
			{
				displayName: 'Longitude',
				name: 'longitude',
				type: 'number',
				typeOptions: {
					numberPrecision: 6,
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['location'],
					},
				},
				default: 0,
				description: 'Longitude of the location',
			},

			// Message -> Send/Broadcast -> Contact Name (for Contact)
			{
				displayName: 'Contact Name',
				name: 'contactName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['contact'],
					},
				},
				default: '',
				description: 'The name of the contact',
			},

			// Message -> Send/Broadcast -> Contact Phone Number (for Contact)
			{
				displayName: 'Contact Phone Number',
				name: 'contactPhoneNumber',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['contact'],
					},
				},
				default: '',
				description: 'The phone number of the contact',
			},

			// Message -> Send/Broadcast -> Sticker ID (for Sticker)
			{
				displayName: 'Sticker ID',
				name: 'stickerId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
						messageType: ['sticker'],
					},
				},
				default: 0,
				description: 'The unique Viber sticker ID',
			},

			// Message -> Send/Broadcast -> Additional Fields
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'broadcast'],
					},
				},
				options: [
					{
						displayName: 'Sender Name',
						name: 'senderName',
						type: 'string',
						default: '',
						description: 'The name of the sender as it will appear in the chat (max 28 characters)',
					},
					{
						displayName: 'Sender Avatar',
						name: 'senderAvatar',
						type: 'string',
						default: '',
						description: 'The URL of the sender avatar image',
					},
					{
						displayName: 'Tracking Data',
						name: 'trackingData',
						type: 'string',
						default: '',
						description: 'Custom tracking data that will be sent back with the user responses',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				const baseUrl = 'https://chatapi.viber.com/pa';
				let endpoint = '';
				const body: IDataObject = {};

				if (resource === 'account') {
					if (operation === 'get') {
						endpoint = '/get_account_info';
					}
				} else if (resource === 'user') {
					if (operation === 'get') {
						endpoint = '/get_user_details';
						body.id = this.getNodeParameter('userId', i) as string;
					}
				} else if (resource === 'webhook') {
					if (operation === 'set') {
						endpoint = '/set_webhook';
						body.url = this.getNodeParameter('url', i) as string;
						body.event_types = this.getNodeParameter('eventTypes', i) as string[];

						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						if (additionalFields.sendName !== undefined) {
							body.send_name = additionalFields.sendName;
						}
						if (additionalFields.sendPhoto !== undefined) {
							body.send_photo = additionalFields.sendPhoto;
						}
					}
				} else if (resource === 'message') {
					if (operation === 'send' || operation === 'broadcast') {
						endpoint = operation === 'send' ? '/send_message' : '/broadcast_message';

						const messageType = this.getNodeParameter('messageType', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						body.type = messageType;

						// Recipient setup
						if (operation === 'send') {
							body.receiver = this.getNodeParameter('receiver', i) as string;
						} else {
							const broadcastListRaw = this.getNodeParameter('broadcastList', i) as string;
							let broadcastList: string[] = [];
							try {
								if (broadcastListRaw.startsWith('[') && broadcastListRaw.endsWith(']')) {
									broadcastList = JSON.parse(broadcastListRaw) as string[];
								} else {
									broadcastList = broadcastListRaw.split(',').map(s => s.trim()).filter(Boolean);
								}
							} catch {
								broadcastList = broadcastListRaw.split(',').map(s => s.trim()).filter(Boolean);
							}
							body.broadcast_list = broadcastList;
						}

						// Sender setup
						const sender: IDataObject = {};
						if (additionalFields.senderName) {
							sender.name = additionalFields.senderName;
						}
						if (additionalFields.senderAvatar) {
							sender.avatar = additionalFields.senderAvatar;
						}
						if (sender.name || sender.avatar) {
							// Viber requires name to be present if sender object is defined
							body.sender = {
								name: sender.name || 'Bot',
								...sender,
							};
						}

						// Tracking data
						if (additionalFields.trackingData) {
							body.tracking_data = additionalFields.trackingData;
						}

						// Type-specific details mapping
						if (messageType === 'text') {
							body.text = this.getNodeParameter('text', i) as string;
						} else if (messageType === 'picture') {
							body.media = this.getNodeParameter('media', i) as string;
							const caption = this.getNodeParameter('caption', i, '') as string;
							if (caption) {
								body.text = caption;
							}
							const thumbnail = this.getNodeParameter('thumbnail', i, '') as string;
							if (thumbnail) {
								body.thumbnail = thumbnail;
							}
						} else if (messageType === 'video') {
							body.media = this.getNodeParameter('media', i) as string;
							body.size = this.getNodeParameter('size', i) as number;
							const duration = this.getNodeParameter('duration', i) as number;
							if (duration) {
								body.duration = duration;
							}
						} else if (messageType === 'file') {
							body.media = this.getNodeParameter('media', i) as string;
							body.size = this.getNodeParameter('size', i) as number;
							body.file_name = this.getNodeParameter('fileName', i) as string;
						} else if (messageType === 'location') {
							body.location = {
								lat: this.getNodeParameter('latitude', i) as number,
								lon: this.getNodeParameter('longitude', i) as number,
							};
						} else if (messageType === 'contact') {
							body.contact = {
								name: this.getNodeParameter('contactName', i) as string,
								phone_number: this.getNodeParameter('contactPhoneNumber', i) as string,
							};
						} else if (messageType === 'sticker') {
							body.sticker_id = this.getNodeParameter('stickerId', i) as number;
						} else if (messageType === 'url') {
							body.media = this.getNodeParameter('media', i) as string;
						}
					}
				}

				if (!endpoint) {
					throw new NodeOperationError(this.getNode(), `The resource/operation combination ${resource}/${operation} is not supported.`, { itemIndex: i });
				}

				const options: IHttpRequestOptions = {
					method: 'POST',
					url: `${baseUrl}${endpoint}`,
					body,
					json: true,
				};

				const responseData = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'viberBotApi',
					options,
				) as IDataObject;

				returnData.push({
					json: responseData,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
