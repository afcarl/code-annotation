import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { push } from 'redux-little-router';
import Page from './Page';
import Loader from '../components/Loader';
import Breadcrumbs from '../components/Breadcrumbs';
import Progress from '../components/Experiment/Progress';
import Diff from '../components/Experiment/Diff';
import Selector from '../components/Experiment/Selector';
import Actions from '../components/Experiment/Actions';
import AdditionActions from '../components/Experiment/AdditionActions';
import {
  markCurrent,
  ANSWER_SIMILAR,
  ANSWER_MAYBE,
  ANSWER_DIFFERENT,
  ANSWER_SKIP,
  getProgressPercent,
  getCurrentFilePair,
} from '../state/assignments';
import { toggleInvisible } from '../state/user';
import { loadFilePair } from '../state/filePairs';
import { makeUrl } from '../state/routes';
import './Experiment.less';

class Experiment extends Component {
  render() {
    const { error, loading, name, description, percent } = this.props;

    if (error) {
      return (
        <Row className="ex-page__oops">
          <Col xs={12}>
            Oops.<br />Something went wrong.
          </Col>
        </Row>
      );
    }

    if (loading) {
      return (
        <Row className="ex-page__loader">
          <Col xs={12}>
            <Loader />
          </Col>
        </Row>
      );
    }

    const breadcrumbsOptions = [{ name, link: '#' }];
    if (description) {
      breadcrumbsOptions.push({ name: description, link: '#' });
    }

    return (
      <Grid fluid className="ex-page__main">
        <Row className="ex-page__header" onMouseEnter={this.props.showHeader}>
          <Col xs={9} className="ex-page__info">
            <Breadcrumbs items={breadcrumbsOptions} />
          </Col>
          <Col xs={3} className="ex-page__progress">
            <Progress percent={percent} />
          </Col>
        </Row>
        {this.renderContent()}
      </Grid>
    );
  }

  renderContent() {
    const {
      expId,
      fileLoading,
      diffString,
      leftLoc,
      rightLoc,
      assignmentsOptions,
      currentAssigment,
      selectAssigmentId,
      markSimilar,
      markMaybe,
      markDifferent,
      skip,
      finish,
    } = this.props;

    if (fileLoading || !diffString) {
      return (
        <div className="ex-page__loader">
          <Loader />
        </div>
      );
    }

    return (
      <React.Fragment>
        <Row className="ex-page__content" onMouseEnter={this.props.hideHeader}>
          <Col xs={12} className="ex-page__diff-col">
            <Diff
              className="ex-page__diff"
              diffString={diffString}
              leftLoc={leftLoc}
              rightLoc={rightLoc}
              showInvisible={this.props.showInvisible}
              toggleInvisible={() =>
                this.props.toggleInvisible(expId, currentAssigment.pairId)
              }
            />
          </Col>
        </Row>
        <Row className="ex-page__footer">
          <Col xs={3}>
            <Selector
              title="Previous"
              options={assignmentsOptions}
              value={currentAssigment.id}
              onChange={e => selectAssigmentId(expId, e.target.value)}
            />
          </Col>
          <Col xs={6} className="ex-page__actions">
            <Actions
              markSimilar={markSimilar}
              markMaybe={markMaybe}
              markDifferent={markDifferent}
            />
          </Col>
          <Col xs={3} className="ex-page__additional-actions">
            <AdditionActions skip={skip} finish={() => finish(expId)} />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { experiment, assignments, user } = state;
  const { error, loading, id, name, description } = experiment;
  const { list, currentAssigment } = assignments;
  const { showInvisible } = user;

  const filePair = getCurrentFilePair(state);
  const diff = filePair ? filePair.diff : null;

  const assignmentsOptions = list.map((a, i) => {
    const status = a.answer ? ` (${a.answer})` : '';
    return { value: a.id, name: `(${i + 1})${status}` };
  });

  return {
    error,
    loading,
    expId: id,
    name,
    description,
    percent: getProgressPercent(state),
    diffString: diff,
    leftLoc: filePair ? filePair.leftLoc : 0,
    rightLoc: filePair ? filePair.rightLoc : 0,
    currentAssigment,
    assignmentsOptions,
    showInvisible,
  };
};

const mapDispatchToProps = dispatch => ({
  markSimilar: () => dispatch(markCurrent(ANSWER_SIMILAR)),
  markMaybe: () => dispatch(markCurrent(ANSWER_MAYBE)),
  markDifferent: () => dispatch(markCurrent(ANSWER_DIFFERENT)),
  skip: () => dispatch(markCurrent(ANSWER_SKIP)),
  selectAssigmentId: (expId, id) =>
    dispatch(push(makeUrl('question', { experiment: expId, question: id }))),
  finish: expId => dispatch(push(makeUrl('finish', { experiment: expId }))),
  toggleInvisible: (expId, id) => {
    dispatch(toggleInvisible());
    return dispatch(loadFilePair(expId, id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  Page(Experiment, { className: 'ex-page', titleFn: props => props.name })
);
