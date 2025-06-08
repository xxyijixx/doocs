package service

import (
	"support-plugin/internal/models"
	"support-plugin/internal/pkg/database"
)

type AgentService struct{}

var Agent = &AgentService{}

func (a *AgentService) Delete(agentID uint) error {
	err := database.GetDB().Delete(&models.Agent{
		ID: agentID,
	}).Error
	return err
}
