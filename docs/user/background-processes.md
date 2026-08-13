# Background processes

The **Processes** surface in the web and desktop right panel shows commands that the coding agent
has started and its provider session still owns. Each row includes the command, elapsed time, and,
when the provider reports them, the working directory and process ID.

Use **Stop all** to interrupt the thread's provider work, including its background tasks. The next
message can resume the thread in a new provider session.

Processes are separate from terminal tabs you open yourself. Those remain in the **Terminal**
surface and are not included in **Stop all**. T3 Code never searches the machine for matching
process names or kills unrelated processes.

On mobile, running commands remain visible in the thread activity and use the thread's existing
stop control; the dedicated **Processes** roster is a right-panel surface on web and desktop.
