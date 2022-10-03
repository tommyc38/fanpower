

# Fanpower

🔎 **The only way to manage your bowling scores**

## Getting Started

Ensure you are running node v14+ and docker/docker-compose installed before running any of the below commands

First, start the backend by running `npm run start-backend`.  This will launch a docker container with postgres
in the background and then begin serving the back end api.

Next, in a new terminal window, run `npm run start-frontend` to launch the front end application.

Helpful commands:
- Launch the postgres database: `nx run api:pg-up`
- Add/Reset database tables and functions: `nx run api:pg-init`
- Stop the database containers: `nx run api:pg-down`
- Start the back end api: `nx serve api -c local`
- Start the front end: `nx serve api -c local`
