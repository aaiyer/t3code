# Text file attachments

Paste or drag a UTF-8 text file into the chat composer to add it as context. T3 Code stores a
temporary copy in the connected environment and inserts a file link into the prompt so the agent
can read it.

Text attachments can be up to 1 MB. Binary files and files with invalid UTF-8 are rejected. Image
files continue to use the image attachment flow.

Removing the file link from a draft releases its temporary copy. T3 Code also releases temporary
copies after a message is sent, or when the owning thread, project, or environment is removed.
