package main

import (
	log "github.com/Sirupsen/logrus"
	"github.com/bazooka-ci/bazooka/commons"
)

func (c *context) addCryptoKey(params map[string]string, body bodyFunc) (*response, error) {
	var key bazooka.CryptoKey

	body(&key)

	if len(key.Content) == 0 {
		return badRequest("content is mandatory")
	}

	project, err := c.Connector.GetProjectById(params["id"])
	if err != nil {
		if err.Error() != "not found" {
			return nil, err
		}
		return notFound("project not found")
	}

	keys, err := c.Connector.GetCryptoKeys(params["id"])
	if err != nil {
		return nil, err
	}

	if len(keys) > 0 {
		return conflict("A key is already associated with this project")
	}

	key.ProjectID = project.ID

	log.WithFields(log.Fields{
		"key": key,
	}).Debug("Adding key")

	if err = c.Connector.AddCryptoKey(&key); err != nil {
		return nil, err
	}

	createdKey := &bazooka.CryptoKey{
		ProjectID: key.ProjectID,
	}

	return created(&createdKey, "/project/"+params["id"]+"/key")
}

func (c *context) updateCryptoKey(params map[string]string, body bodyFunc) (*response, error) {
	var key bazooka.CryptoKey

	body(&key)

	if len(key.Content) == 0 {
		return badRequest("content is mandatory")
	}

	project, err := c.Connector.GetProjectById(params["id"])
	if err != nil {
		if err.Error() != "not found" {
			return nil, err
		}
		return notFound("project not found")
	}

	key.ProjectID = project.ID

	log.WithFields(log.Fields{
		"key": key,
	}).Debug("Updating key")

	if err = c.Connector.UpdateCryptoKey(project.ID, &key); err != nil {
		return nil, err
	}

	updateKey := &bazooka.CryptoKey{
		ProjectID: key.ProjectID,
	}

	return ok(&updateKey)
}
