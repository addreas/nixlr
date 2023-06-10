package github

// TODO implement github device login flow
import (
	"context"
	"fmt"
	"io/ioutil"

	gh "github.com/google/go-github/v53/github"
	"golang.org/x/oauth2"
)

var apiToken *oauth2.Token

func Login(clientId string) error {

	if tryPersistedToken() {
		return nil
	}

	githubOauthConf := oauth2.Config{
		ClientID: clientId,
		Endpoint: oauth2.Endpoint{
			AuthURL:       "https://github.com",
			DeviceAuthURL: "https://github.com/",
			TokenURL:      "https://github.com",
		},
	}

	ctx := context.Background()
	for {
		response, err := githubOauthConf.DeviceAuth(ctx)
		if err != nil {
			return err
		}
		fmt.Printf("please enter code %s at %s\n", response.UserCode, response.VerificationURI)
		token, err := githubOauthConf.Poll(ctx, response)
		if err != nil {
			return err
		}
		apiToken = token
		fmt.Println(token)
		return nil
	}
}

func getClient() *gh.Client {
	ts := oauth2.StaticTokenSource(apiToken)
	tc := oauth2.NewClient(context.Background(), ts)
	return gh.NewClient(tc)
}

func tryPersistedToken() bool {
	existing, err := ioutil.ReadFile("/var/secret/github-token")
	if err != nil {
		return false
	}

	apiToken = &oauth2.Token{AccessToken: string(existing)}
	g := getClient()

	r, err := g.NewRequest("GET", "user", nil)
	if err != nil {
		return false
	}
	res, err := g.Do(context.TODO(), r, nil)
	if err != nil {
		return false
	}

	return res.StatusCode == 200
}
