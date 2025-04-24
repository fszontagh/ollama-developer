import { execSync } from 'child_process';
import { ToolArgs, ToolFunctionItem } from '../tool-manager';

export const tool = async (args: ToolArgs): Promise<string> => {
    let command = args["command"];
    if (Array.isArray(command)) {
        command = command.join(' ');
    }
    try {
        const result = execSync(command, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, LANG: 'en_US.UTF-8' } // force to english...
        });

        return result.length == 0 ? `The command '${command}' finished successfully` : result;
    } catch (error: unknown) {  // Explicitly typing 'error' as 'unknown'

        // Type guard to check if error is an instance of Error
        if (error instanceof Error) {
            // Now we can safely access 'message' as it is guaranteed to exist
            if (error.message.length === 0) {
                return `Failed to run command: ${command}`;
            }
            return error.message;
        }

        // If error is not an instance of Error, return a generic message
        return `An unknown error occurred while executing the command: ${command}`;
    }
};

export const info: ToolFunctionItem = {
    type: "function",
    function: {
        name: "exec",
        description: "Run bash command in the current shell",
        parameters: {
            type: "object",
            properties: {
                "command": {
                    type: "string",
                    description: "The shell comand to exec"
                }
            },
            required: ["command"]
        }

    }
};


