```bash
# install dependencies
npm install

# COPY .env from chat

# export env to bash
export $(cat .env | xargs)

# install pulumi cli
brew install pulumi/tap/pulumi

# login to pulumi, you may need to sign up
pulumi login

# select dev as currently working stack
pulumi stack select dev

# deploy
pulumi up

# destroy
pulumi destroy
```
