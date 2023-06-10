package github

import (
	"context"

	"github.com/google/go-github/v53/github"
)

func PutDeployKey(name string, key string) error {
	_, _, err := getClient().Repositories.CreateKey(context.TODO(), "addreas", "flakefiles", &github.Key{
		Title:    &name,
		Key:      &key,
		ReadOnly: github.Bool(false),
	})

	return err
}
