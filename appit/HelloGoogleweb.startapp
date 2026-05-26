#!/bin/bash

# Define the session name
SESSION="cube"

# Check if the tmux session already exists
tmux has-session -t $SESSION 2>/dev/null

if [ $? != 0 ]; then
    # Session DOES NOT exist -> Create it and set it up
    tmux new-session -d -s $SESSION
    tmux send-keys -t $SESSION "cd /storage/emulated/0/x/Ax9ndroidGo/3dprogramming" C-m
    tmux send-keys -t $SESSION "python -m http.server" C-m
fi

# Finally, attach to the session (whether it was just created or already existed)
tmux attach-session -t $SESSION
