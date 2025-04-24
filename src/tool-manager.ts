// tool-manager.ts

import { readdirSync } from 'fs';
import { join } from 'path';

export type ToolArgs = Record<string, any>;

type ToolFunction = (args: ToolArgs) => Promise<string>;

export type ToolFunctionItem = {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: {
                [key: string]: {
                    type: "string" | "int" | "array" | "enum";
                    description: string;
                    items?: string; // optional, for array types
                    enum?: string[]; // optional, for enum types
                };
            };
            required: string[];
        };

    };
};

const tools: Record<string, ToolFunctionItem> = {};
const toolFunctions: Record<string, ToolFunction> = {};

export const regTool = (name: string, tool: ToolFunctionItem, func: ToolFunction) => {
    tools[name] = tool;
    toolFunctions[name] = func;
};

export const getToolFunc = (name: string): ToolFunction | undefined => {
    return toolFunctions[name];
};

export const getToolInfo = (name: string): ToolFunctionItem | undefined => {
    return tools[name];
};

export const listTools = (): string[] => {
    return Object.keys(tools);
};

export const runTool = async (name: string, args: ToolArgs): Promise<string> => {
    const tool = getToolFunc(name);
    const toolinfo = getToolInfo(name);
    if (!tool) {
        return `Tool: ${name} not found!`;
    }
    if (!toolinfo) {
        return `Tool: ${name} is invalid!`;
    }

    // Check for required parameters
    for (const param of toolinfo.function.parameters.required) {
        if (!(param in args)) {
            return `Tool: ${name} missing or invalid parameter: ${param}!`;
        }
    }

    // Run the tool function
    return tool(args);
};

// Update loadAllTools to import modules dynamically
export const loadAllTools = async () => {
    const toolsPath = join(__dirname, 'tools');
    const files = readdirSync(toolsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of files) {
        const filePath = join(toolsPath, file);
        try {
            // Dynamically import the tool file
            const toolModule = await import(filePath);
            console.info("File:", filePath);

            // Extract tool and info from the imported module
            const { tool, info } = toolModule;
            if (info) {
                console.info(info.function.name);
                regTool(info.function.name, info, tool);
                console.info("Registered tool:", info.function.name);
            } else {
                console.warn(`No valid export found in ${file}`);
            }
        } catch (error) {
            console.error(`Error importing file ${file}:`, error);
        }
    }
};

export const getFunctionDefinitions = () => {
    return Object.values(tools).map(tool => ({
        type: "function",
        function: {
            name: tool.function.name,
            description: tool.function.description,
            parameters: {
                type: "object",
                properties: Object.entries(tool.function.parameters.properties).reduce((acc: Record<string, any>, [key, param]) => {
                    acc[key] = {
                        type: param.type || 'string', // ensure type is defined
                        description: param.description || '',
                        items: param.items || undefined,
                        enum: param.enum || undefined,
                    };
                    return acc;
                }, {}),
                required: tool.function.parameters.required || [],
            },

        },
    }));
};
