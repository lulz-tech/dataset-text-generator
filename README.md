# VK dataset generator

Scrap posts from vk groups

## Installation

```bash
git clone https://github.com/lulz-tech/dataset-text-generator.git
cd ./dataset-text-generator
npm i
```

## Usage

### Instance mode

```bash
node app.js --mode=instance --login=VkLogin --password=VkPass --groupId=-VkGroupId --out=OutputFileName
```

### Microservice mode

```bash
node app.js --mode=miсroservice --port=port
Open ip:port/getDataset?login=VKLogin&password=VKPass&groupId=groupId
```
