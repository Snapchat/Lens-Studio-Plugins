
/**
 * Parse the output of the git status command and print a cat based on the result.
 * Most of the code here is for formatting the output to look like a chat bubble in the console.
 */
export default function printGitStatusCat(result) {
    const lines = [];

    if (result.stderr.toString().trim() !== "") {
        const output = result.stderr.toString().trim();
        lines.push(output);
    } else if (result.success) {
        const output = result.stdout.toString().trim();

        if (output === "") {
            lines.push("No changes yet...meow!");
        } else {
            const unmodifiedFiles = [];
            const modifiedFiles = [];
            const typeChangedFiles = [];
            const addedFiles = [];
            const deletedFiles = [];
            const renamedFiles = [];
            const copiedFiles = [];
            const updatedButUnmergedFiles = [];

            const statusRegex = /^([ MARC?DU]{2})(?: )?(.*)/;

            output.split("\n").forEach(line => {
                const match = line.match(statusRegex);
                if (match) {
                    const status = match[1].trim();
                    const file = match[2];

                    switch (status) {
                        case " ":
                            unmodifiedFiles.push(file);
                            break;
                        case "M":
                            modifiedFiles.push(file);
                            break;
                        case "T":
                            typeChangedFiles.push(file);
                            break;
                        case "A":
                            addedFiles.push(file);
                            break;
                        case "D":
                            deletedFiles.push(file);
                            break;
                        case "R":
                            renamedFiles.push(file);
                            break;
                        case "C":
                            copiedFiles.push(file);
                            break;
                        case "U":
                            updatedButUnmergedFiles.push(file);
                            break;
                    }
                }
            });

            if (unmodifiedFiles.length > 0) {
                lines.push("Unmodified files:");
                lines.push(...unmodifiedFiles.map(file => `- ${file}`));
                lines.push("");
            }

            if (modifiedFiles.length > 0) {
                lines.push("Modified files:");
                lines.push(...modifiedFiles.map(file => `- ${file}`));
                lines.push("");
            }

            if (typeChangedFiles.length > 0) {
                lines.push("File type changed:");
                lines.push(...typeChangedFiles.map(file => `- ${file}`));
                lines.push("");
            }

            if (addedFiles.length > 0) {
                lines.push("Added files:");
                lines.push(...addedFiles.map(file => `- ${file}`));
                lines.push("");
            }

            if (deletedFiles.length > 0) {
                lines.push("Deleted files:");
                lines.push(...deletedFiles.map(file => `- ${file}`));
                lines.push("");
            }

            if (renamedFiles.length > 0) {
                lines.push("Renamed files:");
                lines.push(...renamedFiles.map(file => `- ${file}`));
                lines.push("");
            }

            if (copiedFiles.length > 0) {
                lines.push("Copied files:");
                lines.push(...copiedFiles.map(file => `- ${file}`));
                lines.push("");
            }

            if (updatedButUnmergedFiles.length > 0) {
                lines.push("Updated but unmerged files:");
                lines.push(...updatedButUnmergedFiles.map(file => `- ${file}`));
                lines.push("");
            }
        }
    }

    const chatBubble = generateChatBubble(lines);

    const cat = `
${chatBubble}
             ／l、
            (ﾟ､｡ ７
             l  ~ ヽ
             じしf_,)ノ
    `;
    return cat;
}

function generateChatBubble(lines) {
    const maxLineLength = Math.max(...lines.map(line => line.length));
    const bubbleWidth = Math.max(maxLineLength, 20);
    let bubble = "  " + "_".repeat(bubbleWidth + 2) + "\n";
    for (const line of lines) {
        bubble += " / " + line + " ".repeat(bubbleWidth - line.length) + " \\\n";
    }
    bubble += " \\_" + "_".repeat(bubbleWidth) + "_/\n";
    bubble += "    \\\n";
    bubble += "     \\\n";
    return bubble;
}
