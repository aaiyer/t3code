# Environment health

T3 Code can show the resource usage of the machine that hosts a connected environment, including
remote and T3 Connect environments.

On web and desktop, the active environment appears in the bottom of the thread sidebar with its
current CPU and memory usage. Select it to compare overall host usage with the CPU and memory used
by T3 Code, see the host uptime and collector status, or open the full diagnostics page.

On mobile, open **Environments** and expand a connected environment to see its host and T3 Code
usage.

The full **Settings → Diagnostics** page includes current host CPU, memory, load average, uptime,
bounded CPU and memory history, and the existing T3 Code process details. The compact remote update
stream is active only while a health surface is being observed. History is retained in bounded
memory and is not saved to disk.

Host metrics show as unavailable when the environment does not include a compatible resource
monitor. This does not affect the environment or its agents.
