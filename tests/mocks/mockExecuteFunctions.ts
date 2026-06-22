/* eslint-disable */
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

interface MockOptions {
	nodeParameters?: Record<string, any>;
	inputData?: INodeExecutionData[];
	continueOnFail?: boolean;
	httpRequestResponse?: any;
}

export function createMockExecuteFunctions(options: MockOptions = {}): IExecuteFunctions {
	const nodeParameters = options.nodeParameters || {};
	const inputData = options.inputData || [{ json: {} }];
	const continueOnFail = options.continueOnFail ?? false;
	const httpRequestResponse = options.httpRequestResponse || {};

	const mockContext: any = {
		getInputData: jest.fn().mockReturnValue(inputData),
		getNodeParameter: jest.fn().mockImplementation((paramName: string, itemIndex: number, fallback?: any) => {
			if (paramName in nodeParameters) {
				return nodeParameters[paramName];
			}
			return fallback;
		}),
		getNode: jest.fn().mockReturnValue({ name: 'viberBot' }),
		continueOnFail: jest.fn().mockReturnValue(continueOnFail),
		helpers: {},
	};

	// Implement httpRequestWithAuthentication which can be called with .call(this)
	mockContext.helpers.httpRequestWithAuthentication = jest.fn().mockImplementation(
		async function(this: any, credentialName: string, requestOptions: any) {
			return Promise.resolve(httpRequestResponse);
		}
	);

	return mockContext as unknown as IExecuteFunctions;
}
