FROM mcr.microsoft.com/mssql/server:2022-latest


# Bundle config source
COPY . /cheto/config
WORKDIR /cheto/config

# Grant permissions for to our scripts to be executable
RUN chmod +x /cheto/config/entrypoint.sh
RUN chmod +x /cheto/config/configure-db.sh

ENTRYPOINT ["./entrypoint.sh"]