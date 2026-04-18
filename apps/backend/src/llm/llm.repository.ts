import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LlmDto } from './llm.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

@Injectable()
export class LlmRepository {
  private llmClient: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.llmClient = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateResponse(llmDto: LlmDto) {
    const { history, userId, token } = llmDto;

    if (!history || !Array.isArray(history) || history.length === 0) {
      throw new BadRequestException('Invalid history');
    }

    const nestApiUrl = this.configService.get<string>('NESTJS_API_URL');

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'get_contacts',
          description:
            'Get a list of all contacts for the current user from the CRM system.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_companies',
          description:
            'Get a list of all companies for the current user from the CRM system.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_contracts',
          description:
            'Get a list of all contracts or deals for the current user from the CRM system.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_receipts',
          description:
            'Get a list of all receipts for the current user from the CRM system.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_sales_records',
          description:
            'Get a list of all sales records for the current user. Useful for questions about revenue, what was sold, and to whom.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_expense_records',
          description:
            'Get a list of all expense records for the current user. Useful for questions about costs, spending, COGS, and operating expenses.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_poultry_egg_records',
          description:
            'Get poultry egg collection and grading records. Can be filtered by a specific flock name if provided.',
          parameters: {
            type: 'object',
            properties: {
              flock_name: {
                type: 'string',
                description: 'The name of the flock to filter egg records by.',
              },
            },
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_warehouses',
          description:
            'Get a list of all warehouses for the current user, including their name, type, and location.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_inventory_items',
          description:
            'Get a list of inventory items. Can be filtered by a specific warehouse name if provided by the user.',
          parameters: {
            type: 'object',
            properties: {
              warehouse_name: {
                type: 'string',
                description:
                  'The name of the warehouse to filter inventory items by. If omitted, items from all warehouses are returned.',
              },
            },
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_labour_records',
          description:
            'Get a list of all employees (labour) for the current user, including their personal details, role, and contact information.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_labour_payments',
          description:
            'Get a list of salary payments made to employees. Can be filtered by employee name.',
          parameters: {
            type: 'object',
            properties: {
              employee_name: {
                type: 'string',
                description:
                  'The full name of the employee to filter payment records for.',
              },
            },
            required: [],
          },
        },
      },
    ];

    const currentDate = new Date().toString();
    const systemPrompt = `The current date and time is ${currentDate}. You are a helpful assistant for Graminate, an agricultural platform. You are an expert in agricultural sciences, also including Poultry, Animal Rearing and Bee Keeping. You can also help users by fetching their data, like contacts, companies, contracts, receipts, sales, expenses, poultry, warehouses, inventory, and employee (labour) data from the system using the provided tools. You can calculate financial metrics like total revenue, total expenses, and profit from this data. When asked about poultry eggs, remember that egg sizes (small, medium, large, extra-large) are based on Indian standards. When asked to fetch data, use the tools. For any other topics, politely decline and state your purpose. When presenting lists of data, format them clearly and always use markdown tables.`;

    const conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [
        { role: 'system', content: systemPrompt },
        ...history.map((message: Message & { name?: string }) => {
          if (message.sender === 'user') {
            return {
              role: 'user',
              content: message.text,
            } as OpenAI.Chat.Completions.ChatCompletionUserMessageParam;
          } else if (message.sender === 'bot' && message.name) {
            return {
              role: 'tool',
              tool_call_id: message.name,
              content: message.text,
            } as OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
          } else {
            return {
              role: 'assistant',
              content: message.text,
            } as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam;
          }
        }),
      ];

    try {
      const initialResponse = await this.llmClient.chat.completions.create({
        model: 'gpt-4o',
        messages: conversationHistory,
        tools: tools,
        tool_choice: 'auto',
      });

      const responseMessage = initialResponse.choices[0].message;
      const toolCalls = responseMessage.tool_calls;

      if (toolCalls) {
        const availableFunctions = {
          get_contacts: async () => {
            const { data } = await firstValueFrom(
              this.httpService.get<any>(
                `${nestApiUrl}/api/contacts/${userId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              ),
            );
            if (data.contacts && data.contacts.length > 0) {
              return JSON.stringify(
                data.contacts.map((c: any) => ({
                  name: `${c.first_name} ${c.last_name || ''}`.trim(),
                  phone: c.phone_number,
                  email: c.email,
                  type: c.type,
                })),
              );
            }
            return JSON.stringify({ message: 'No contacts found.' });
          },
          get_companies: async () => {
            const { data } = await firstValueFrom(
              this.httpService.get<any>(
                `${nestApiUrl}/api/companies/${userId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              ),
            );
            if (data.companies && data.companies.length > 0) {
              return JSON.stringify(
                data.companies.map((c: any) => ({
                  company_name: c.company_name,
                  contact_person: c.contact_person,
                  email: c.email,
                  phone: c.phone_number,
                  type: c.type,
                })),
              );
            }
            return JSON.stringify({ message: 'No companies found.' });
          },
          get_contracts: async () => {
            const { data } = await firstValueFrom(
              this.httpService.get<any>(
                `${nestApiUrl}/api/contracts/${userId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              ),
            );
            if (data.contracts && data.contracts.length > 0) {
              return JSON.stringify(
                data.contracts.map((c: any) => ({
                  deal_name: c.deal_name,
                  partner: c.partner,
                  stage: c.stage,
                  amount: c.amount,
                  end_date: c.end_date,
                })),
              );
            }
            return JSON.stringify({ message: 'No contracts found.' });
          },
          get_receipts: async () => {
            const { data } = await firstValueFrom(
              this.httpService.get<any>(
                `${nestApiUrl}/api/receipts/${userId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              ),
            );
            if (data.receipts && data.receipts.length > 0) {
              return JSON.stringify(
                data.receipts.map((r: any) => ({
                  title: r.title,
                  bill_to: r.bill_to,
                  due_date: r.due_date,
                  receipt_date: r.receipt_date,
                })),
              );
            }
            return JSON.stringify({ message: 'No receipts found.' });
          },
          get_sales_records: async () => {
            const { data } = await firstValueFrom(
              this.httpService.get<any>(
                `${nestApiUrl}/api/sales/user/${userId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              ),
            );
            if (data.sales && data.sales.length > 0) {
              return JSON.stringify(
                data.sales.map((s: any) => ({
                  sale_name: s.sales_name,
                  date: s.sales_date,
                  occupation: s.occupation,
                  items: s.items_sold.join(', '),
                  total_amount: s.quantities_sold.reduce(
                    (sum: number, qty: number, idx: number) =>
                      sum +
                      qty *
                        (s.prices_per_unit && s.prices_per_unit[idx]
                          ? s.prices_per_unit[idx]
                          : 0),
                    0,
                  ),
                })),
              );
            }
            return JSON.stringify({ message: 'No sales records found.' });
          },
          get_expense_records: async () => {
            const { data } = await firstValueFrom(
              this.httpService.get<any>(
                `${nestApiUrl}/api/expenses/user/${userId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              ),
            );
            if (data.expenses && data.expenses.length > 0) {
              return JSON.stringify(
                data.expenses.map((e: any) => ({
                  title: e.title,
                  date: e.date_created,
                  occupation: e.occupation,
                  category: e.category,
                  amount: e.expense,
                })),
              );
            }
            return JSON.stringify({ message: 'No expense records found.' });
          },
          get_poultry_egg_records: async (args: { flock_name?: string }) => {
            const { flock_name } = args;
            const { data: flocksData } = await firstValueFrom(
              this.httpService.get<any>(
                `${nestApiUrl}/api/flock/user/${userId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              ),
            );
            const flocks = flocksData.flocks || [];
            if (flocks.length === 0) {
              return JSON.stringify({ message: 'No poultry flocks found.' });
            }
            let targetFlocks = flocks;
            if (flock_name) {
              const foundFlock = flocks.find(
                (f: any) =>
                  f.flock_name.toLowerCase() === flock_name.toLowerCase(),
              );
              if (foundFlock) {
                targetFlocks = [foundFlock];
              } else {
                return JSON.stringify({
                  message: `Could not find a flock named "${flock_name}". Please check the name.`,
                });
              }
            }
            const allEggRecords: any[] = [];
            for (const flock of targetFlocks) {
              const { data: eggData } = await firstValueFrom(
                this.httpService.get<any>(
                  `${nestApiUrl}/api/poultry-eggs/${userId}?flockId=${flock.flock_id}`,
                  { headers: { Authorization: `Bearer ${token}` } },
                ),
              );
              if (eggData.records && eggData.records.length > 0) {
                const recordsWithFlockName = eggData.records.map(
                  (rec: any) => ({ ...rec, flock_name: flock.flock_name }),
                );
                allEggRecords.push(...recordsWithFlockName);
              }
            }
            if (allEggRecords.length === 0) {
              return JSON.stringify({
                message: flock_name
                  ? `No egg records found for flock "${flock_name}".`
                  : 'No egg records found for any of your flocks.',
              });
            }
            return JSON.stringify(
              allEggRecords.map((r) => ({
                flock_name: r.flock_name,
                date_collected: r.date_collected,
                small_eggs: r.small_eggs,
                medium_eggs: r.medium_eggs,
                large_eggs: r.large_eggs,
                extra_large_eggs: r.extra_large_eggs,
                total_eggs: r.total_eggs,
                broken_eggs: r.broken_eggs,
              })),
            );
          },
          get_warehouses: async () => {
            const { data } = await firstValueFrom(
              this.httpService.get<any>(
                `${nestApiUrl}/api/warehouse/user/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } },
              ),
            );
            if (data.warehouses && data.warehouses.length > 0) {
              return JSON.stringify(
                data.warehouses.map((w: any) => ({
                  name: w.name,
                  type: w.type,
                  location: [w.city, w.state].filter(Boolean).join(', '),
                  capacity: w.storage_capacity,
                })),
              );
            }
            return JSON.stringify({ message: 'No warehouses found.' });
          },
          get_inventory_items: async (args: { warehouse_name?: string }) => {
            const { warehouse_name } = args;
            let warehouseId = null;
            if (warehouse_name) {
              const { data: warehousesData } = await firstValueFrom(
                this.httpService.get<any>(
                  `${nestApiUrl}/api/warehouse/user/${userId}`,
                  { headers: { Authorization: `Bearer ${token}` } },
                ),
              );
              const warehouse = warehousesData.warehouses?.find(
                (w: any) =>
                  w.name.toLowerCase() === warehouse_name.toLowerCase(),
              );
              if (warehouse) {
                warehouseId = warehouse.warehouse_id;
              } else {
                return JSON.stringify({
                  message: `Warehouse '${warehouse_name}' not found.`,
                });
              }
            }
            const inventoryUrl = warehouseId
              ? `${nestApiUrl}/api/inventory/${userId}?warehouse_id=${warehouseId}`
              : `${nestApiUrl}/api/inventory/${userId}`;
            const { data: inventoryData } = await firstValueFrom(
              this.httpService.get<any>(inventoryUrl, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            );
            if (inventoryData.items && inventoryData.items.length > 0) {
              return JSON.stringify(
                inventoryData.items.map((item: any) => ({
                  item_name: item.item_name,
                  item_group: item.item_group,
                  quantity: item.quantity,
                  units: item.units,
                  price_per_unit: item.price_per_unit,
                  minimum_limit: item.minimum_limit,
                })),
              );
            }
            const message = warehouse_name
              ? `No inventory items found in warehouse '${warehouse_name}'.`
              : 'No inventory items found.';
            return JSON.stringify({ message });
          },
          get_labour_records: async () => {
            const { data } = await firstValueFrom(
              this.httpService.get<any>(`${nestApiUrl}/api/labour/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            );
            if (data.labours && data.labours.length > 0) {
              return JSON.stringify(
                data.labours.map((l: any) => ({
                  full_name: l.full_name,
                  role: l.role,
                  contact: l.contact_number,
                  city: l.city,
                  state: l.state,
                  base_salary: l.base_salary,
                })),
              );
            }
            return JSON.stringify({ message: 'No employees found.' });
          },
          get_labour_payments: async (args: { employee_name?: string }) => {
            const { employee_name } = args;
            const { data: labourData } = await firstValueFrom(
              this.httpService.get<any>(`${nestApiUrl}/api/labour/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            );
            const allLabours = labourData.labours || [];
            if (allLabours.length === 0) {
              return JSON.stringify({ message: 'No employees found.' });
            }
            let targetLabours = allLabours;
            if (employee_name) {
              const foundLabour = allLabours.find(
                (l: any) =>
                  l.full_name.toLowerCase() === employee_name.toLowerCase(),
              );
              if (foundLabour) {
                targetLabours = [foundLabour];
              } else {
                return JSON.stringify({
                  message: `Employee '${employee_name}' not found.`,
                });
              }
            }
            const allPayments: any[] = [];
            for (const labour of targetLabours) {
              const { data: paymentData } = await firstValueFrom(
                this.httpService.get<any>(
                  `${nestApiUrl}/api/labour_payment/${labour.labour_id}`,
                  { headers: { Authorization: `Bearer ${token}` } },
                ),
              );
              const payments =
                paymentData.payments || paymentData.data?.payments || [];
              const paymentsWithEmployeeName = payments.map((p: any) => ({
                ...p,
                full_name: labour.full_name,
              }));
              allPayments.push(...paymentsWithEmployeeName);
            }
            if (allPayments.length === 0) {
              return JSON.stringify({ message: 'No payment records found.' });
            }
            return JSON.stringify(
              allPayments.map((p) => ({
                employee_name: p.full_name,
                payment_date: p.payment_date,
                total_amount: p.total_amount,
                payment_status: p.payment_status,
              })),
            );
          },
        };

        conversationHistory.push(responseMessage);

        for (const toolCall of toolCalls) {
          if (toolCall.type === 'function') {
            const functionName = toolCall.function
              .name as keyof typeof availableFunctions;
            const functionToCall = availableFunctions[functionName];

            if (functionToCall) {
              const functionArgs = toolCall.function.arguments
                ? JSON.parse(toolCall.function.arguments)
                : {};
              const functionResponse = await functionToCall(functionArgs);
              conversationHistory.push({
                tool_call_id: toolCall.id,
                role: 'tool',
                content: functionResponse,
              });
            }
          }
        }

        const finalResponse = await this.llmClient.chat.completions.create({
          model: 'gpt-4o',
          messages: conversationHistory,
        });

        return { answer: finalResponse.choices[0].message.content };
      } else {
        const answer = responseMessage.content?.trim();
        return { answer };
      }
    } catch (error) {
      console.error('LLM API or downstream error:', error);
      throw new InternalServerErrorException(
        'Failed to fetch response from the assistant.',
      );
    }
  }
}
