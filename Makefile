# Go 应用程序名称
APP_NAME := support-plugin

# Go 源文件目录
SRC_DIR := .

# 构建输出目录
BUILD_DIR := ./bin

# Swagger 文档目录
SWAG_DIR := ./docs

.PHONY: all build run clean swag

all: build

build:
	@echo "Building $(APP_NAME)..."
	@mkdir -p $(BUILD_DIR)
	@go build -o $(BUILD_DIR)/$(APP_NAME) $(SRC_DIR)/main.go
	@echo "Build complete: $(BUILD_DIR)/$(APP_NAME)"

run:
	@echo "Running $(APP_NAME) directly with go run..."
	@go run $(SRC_DIR)/main.go

clean:
	@echo "Cleaning up..."
	@rm -rf $(BUILD_DIR)
	@rm -rf $(SWAG_DIR)/*.go $(SWAG_DIR)/*.json $(SWAG_DIR)/*.yaml
	@echo "Clean complete."

swag:
	@echo "Generating Swagger documentation..."
	@swag init
	@echo "Swagger documentation generated."