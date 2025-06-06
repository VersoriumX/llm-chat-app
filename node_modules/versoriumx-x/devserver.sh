#!/bin/sh
source .venv/bin/activate
python -m flask --app main run -p $8546 --debug