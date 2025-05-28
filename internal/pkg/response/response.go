package response

import (
	"net/http"
	"support-plugin/internal/models"

	"github.com/gin-gonic/gin"
)

// Success 成功响应
func Success(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, models.Response{
		Code:    http.StatusOK,
		Message: message,
		Data:    data,
	})
}

// Fail 失败响应
func Fail(c *gin.Context, statusCode int, message string, err error) {
	response := models.Response{
		Code:    statusCode,
		Message: message,
	}

	if err != nil {
		response.Error = err.Error()
	}

	c.JSON(statusCode, response)
}

// BadRequest 400错误响应
func BadRequest(c *gin.Context, message string, err error) {
	Fail(c, http.StatusBadRequest, message, err)
}

// ServerError 500错误响应
func ServerError(c *gin.Context, message string, err error) {
	Fail(c, http.StatusInternalServerError, message, err)
}

// NotFound 404错误响应
func NotFound(c *gin.Context, message string) {
	Fail(c, http.StatusNotFound, message, nil)
}

// SuccessWithPagination 带分页的成功响应
func SuccessWithPagination(c *gin.Context, message string, items interface{}, total int64, page, pageSize int) {
	pages := int64(0)
	if pageSize > 0 {
		pages = (total + int64(pageSize) - 1) / int64(pageSize)
	}

	pagination := models.PaginationData{
		Total:    total,
		Page:     page,
		PageSize: pageSize,
		Pages:    pages,
		Items:    items,
	}

	Success(c, message, pagination)
}
