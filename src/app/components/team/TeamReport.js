import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import HelpIcon from '@material-ui/icons/HelpOutline';
import { ContentColumn, checkBlue } from '../../styles/js/shared';
import Can from '../Can';
import TeamRoute from '../../relay/TeamRoute';
import Message from '../Message';
import LanguageSwitcher from '../LanguageSwitcher';
import UpdateTeamMutation from '../../relay/mutations/UpdateTeamMutation';
import { stringHelper } from '../../customHelpers';

class TeamReportComponent extends React.Component {
  constructor(props) {
    super(props);
    const report = props.team.get_report || {};
    this.state = {
      message: null,
      report: JSON.parse(JSON.stringify(report)),
      currentLanguage: props.team.get_language || 'en',
    };
  }

  handleUpdate(field, value) {
    const { currentLanguage } = this.state;
    const report = JSON.parse(JSON.stringify(this.state.report));
    report[currentLanguage] = report[currentLanguage] || {};
    report[currentLanguage][field] = value;
    this.setState({ report });
  }

  handleChangeLanguage(newLanguage) {
    this.setState({ currentLanguage: newLanguage });
  }

  handleSubmit() {
    const onFailure = () => {
      this.setState({
        message: <FormattedMessage
          id="teamReport.updateFail"
          defaultMessage="Sorry, an error occurred while updating the report settings. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />,
      });
    };

    const onSuccess = () => {
      this.setState({
        message: <FormattedMessage
          id="teamReport.updateSuccess"
          defaultMessage="Report settings updated successfully!"
        />,
      });
    };

    Relay.Store.commitUpdate(
      new UpdateTeamMutation({
        id: this.props.team.id,
        report: JSON.stringify(this.state.report),
      }),
      { onSuccess, onFailure },
    );
  }

  render() {
    const { team } = this.props;
    const { currentLanguage } = this.state;
    const report = this.state.report[currentLanguage] || {};
    const defaultLanguage = team.get_language || 'en';
    const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];

    return (
      <ContentColumn large>
        <Message message={this.state.message} />
        <LanguageSwitcher
          primaryLanguage={defaultLanguage}
          currentLanguage={currentLanguage}
          languages={languages}
          onChange={this.handleChangeLanguage.bind(this)}
        />
        <Can permissions={team.permissions} permission="update Team">
          <Box mt={2} display="flex" alignItems="end" justifyContent="end">
            <p>
              <Button onClick={this.handleSubmit.bind(this)} primary>
                <FormattedMessage id="teamReport.save" defaultMessage="Save" />
              </Button>
            </p>
          </Box>
        </Can>
        <Box mt={2}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center">
                  <FormattedMessage
                    id="teamReport.title"
                    defaultMessage="Default report settings"
                  />
                  <a href="http://help.checkmedia.org/en/articles/3627266-check-message-report" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <HelpIcon style={{ margin: '0 2px', color: checkBlue }} />
                  </a>
                </Box>
              }
              subheader={
                <FormattedMessage
                  id="teamReport.subtitle"
                  defaultMessage="The content you set here can be edited in each individual report"
                />
              }
            />
            <CardContent>
              <Box display="flex" alignItems="center">
                <Checkbox
                  id="use_introduction"
                  key={`use-introduction-${currentLanguage}`}
                  checked={report.use_introduction || false}
                  onChange={(e) => { this.handleUpdate('use_introduction', e.target.checked); }}
                />
                <h3><FormattedMessage id="teamReport.introduction" defaultMessage="Introduction" /></h3>
              </Box>
              <Box py={0}>
                <TextField
                  id="introduction"
                  key={`introduction-${currentLanguage}`}
                  value={report.introduction || ''}
                  onChange={(e) => { this.handleUpdate('introduction', e.target.value); }}
                  multiline
                  variant="outlined"
                  rows="10"
                  fullWidth
                />
              </Box>
              <Box mt={1}>
                <div style={{ lineHeight: '1.5em' }}>
                  <FormattedMessage
                    id="teamReport.introductionSub"
                    defaultMessage="Use {query_date} placeholder to display the date of the original query. Use {status} to communicate the status of the article."
                    values={{
                      query_date: '{{query_date}}',
                      status: '{{status}}',
                    }}
                  />
                  <a href="http://help.checkmedia.org/en/articles/3627266-check-message-report" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', verticalAlign: 'bottom' }}>
                    <HelpIcon style={{ margin: '0 2px', color: checkBlue }} />
                  </a>
                </div>
              </Box>
              <Box mt={4} display="flex" alignItems="center">
                <Checkbox
                  id="use_disclaimer"
                  key={`use-disclaimer-${currentLanguage}`}
                  checked={report.use_disclaimer || false}
                  onChange={(e) => { this.handleUpdate('use_disclaimer', e.target.checked); }}
                />
                <h3><FormattedMessage id="teamReport.disclaimer" defaultMessage="Disclaimer" /></h3>
              </Box>
              <Box py={0}>
                <TextField
                  id="disclaimer"
                  key={`disclaimer-${currentLanguage}`}
                  value={report.disclaimer || ''}
                  onChange={(e) => { this.handleUpdate('disclaimer', e.target.value); }}
                  fullWidth
                />
              </Box>
              <Box mt={1}>
                <div style={{ lineHeight: '1.5em' }}>
                  <FormattedMessage id="teamReport.disclaimerSub" defaultMessage="Disclaimer that will be shown at the bottom of the report with the workspace logo." />
                </div>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </ContentColumn>
    );
  }
}

const TeamReportContainer = Relay.createContainer(TeamReportComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id
        dbid
        permissions
        get_report
        get_language
        get_languages
      }
    `,
  },
});

const TeamReport = (props) => {
  const route = new TeamRoute({ teamSlug: props.team.slug });
  const params = { propTeam: props.team };
  return (
    <Relay.RootContainer
      Component={TeamReportContainer}
      route={route}
      renderFetched={data => <TeamReportContainer {...data} {...params} />}
    />
  );
};

export default TeamReport;
