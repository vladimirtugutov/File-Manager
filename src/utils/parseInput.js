export const parseCommand = (input) => {
    const [command, ...args] = input.trim().split(' ');
    return { command, args };
};