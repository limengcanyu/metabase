import React from "react";

import cx from "classnames";

import QueryBuilderTutorial from "metabase/tutorial/QueryBuilderTutorial";

import GuiQueryEditor from "../GuiQueryEditor";
import NativeQueryEditor from "../NativeQueryEditor";
import QueryVisualization from "../QueryVisualization";
import DataReference from "../dataref/DataReference";
import TagEditorSidebar from "../template_tags/TagEditorSidebar";
import SavedQuestionIntroModal from "../SavedQuestionIntroModal";

import DebouncedFrame from "metabase/components/DebouncedFrame";

import QueryModals from "../QueryModals";
import { ViewTitleHeader, ViewSubHeader } from "./ViewHeader";
import ViewFooter from "./ViewFooter";
import ViewSidebar from "./ViewSidebar";

import ChartSettingsSidebar from "./sidebars/ChartSettingsSidebar";
import ChartTypeSidebar from "./sidebars/ChartTypeSidebar";

import FilterSidebar from "./sidebars/FilterSidebar";
import AggregationSidebar from "./sidebars/AggregationSidebar";
import BreakoutSidebar from "./sidebars/BreakoutSidebar";

import NativeQuery from "metabase-lib/lib/queries/NativeQuery";
import StructuredQuery from "metabase-lib/lib/queries/StructuredQuery";

const UI_CONTROLS_DEFAULTS = {
  isAddingFilter: false,
  isEditingFilterIndex: null,
  isAddingAggregation: false,
  isEditingAggregationIndex: null,
  isAddingBreakout: false,
  isEditingBreakoutIndex: null,
};

export default class View extends React.Component {
  // FILTER
  handleOpenAddFilter = () => {
    this.props.setUIControls({
      ...UI_CONTROLS_DEFAULTS,
      isAddingFilter: true,
    });
  };
  handleOpenEditFilter = index => {
    this.props.setUIControls({
      ...UI_CONTROLS_DEFAULTS,
      isEditingFilterIndex: index,
    });
  };
  handleCloseFilter = index => {
    this.props.setUIControls({
      ...UI_CONTROLS_DEFAULTS,
    });
  };

  // AGGREGATION
  handleOpenAddAggregation = () => {
    this.props.setUIControls({
      ...UI_CONTROLS_DEFAULTS,
      isAddingAggregation: true,
    });
  };
  handleOpenEditAggregation = index => {
    this.props.setUIControls({
      ...UI_CONTROLS_DEFAULTS,
      isEditingAggregationIndex: index,
    });
  };
  handleCloseAggregation = () => {
    this.props.setUIControls({
      ...UI_CONTROLS_DEFAULTS,
    });
  };

  // BREAKOUT
  handleOpenAddBreakout = () => {
    this.props.setUIControls({
      ...UI_CONTROLS_DEFAULTS,
      isAddingBreakout: true,
    });
  };
  handleOpenEditBreakout = index => {
    this.props.setUIControls({
      ...UI_CONTROLS_DEFAULTS,
      isEditingBreakoutIndex: index || 0,
    });
  };
  handleCloseBreakout = () => {
    this.props.setUIControls({
      ...UI_CONTROLS_DEFAULTS,
    });
  };

  handleOpenChartSettings = initial => {
    // TODO: move to reducer
    this.props.setUIControls({
      isShowingTable: false,
      isShowingChartSettingsSidebar: true,
      initialChartSetting: initial,
    });
  };

  render() {
    const {
      question,
      query,
      card,
      isDirty,
      databases,
      isShowingTemplateTagsEditor,
      isShowingDataReference,
      isShowingTutorial,
      isShowingNewbModal,
      isShowingChartTypeSidebar,
      isShowingChartSettingsSidebar,
      isAddingFilter,
      isEditingFilterIndex,
      isAddingAggregation,
      isEditingAggregationIndex,
      isAddingBreakout,
      isEditingBreakoutIndex,
      queryBuilderMode,
      mode,
    } = this.props;

    const propsWithExtras = {
      ...this.props,
      onOpenAddFilter: this.handleOpenAddFilter,
      onOpenEditFilter: this.handleOpenEditFilter,
      onOpenAddAggregation: this.handleOpenAddAggregation,
      onOpenEditBreakout: this.handleOpenEditBreakout,
      onOpenChartSettings: this.handleOpenChartSettings,
    };

    // if we don't have a card at all or no databases then we are initializing, so keep it simple
    if (!card || !databases) {
      return <div />;
    }

    const ModeFooter = mode && mode.ModeFooter;
    const isStructured = query instanceof StructuredQuery;

    // only allow editing of series for structured queries
    const onAddSeries = isStructured ? this.handleOpenAddAggregation : null;
    const onEditSeries = isStructured
      ? (card, index) => this.handleOpenEditAggregation(index)
      : null;
    const onRemoveSeries =
      isStructured && query.aggregations().length > 1
        ? (card, index) => {
            const agg = query.aggregations()[index];
            agg.remove().update(null, { run: true });
          }
        : null;
    const onEditBreakout =
      isStructured && query.breakouts().length > 0
        ? this.handleOpenEditBreakout
        : null;

    const canShowStructuredQuerySidebars =
      queryBuilderMode !== "notebook" && isStructured;

    const leftSideBar =
      canShowStructuredQuerySidebars &&
      (isEditingFilterIndex != null || isAddingFilter ? (
        <FilterSidebar
          question={question}
          index={isEditingFilterIndex}
          onClose={this.handleCloseFilter}
        />
      ) : canShowStructuredQuerySidebars &&
      (isEditingAggregationIndex != null || isAddingAggregation) ? (
        <AggregationSidebar
          question={question}
          index={isEditingAggregationIndex}
          onClose={this.handleCloseAggregation}
        />
      ) : canShowStructuredQuerySidebars &&
      (isEditingBreakoutIndex != null || isAddingBreakout) ? (
        <BreakoutSidebar
          question={question}
          index={isEditingBreakoutIndex}
          onClose={this.handleCloseBreakout}
        />
      ) : isShowingChartSettingsSidebar ? (
        <ChartSettingsSidebar
          {...propsWithExtras}
          onClose={() =>
            this.props.setUIControls({
              isShowingChartSettingsSidebar: false,
              isShowingChartTypeSidebar: false,
            })
          }
        />
      ) : isShowingChartTypeSidebar ? (
        <ChartTypeSidebar {...propsWithExtras} />
      ) : null);

    const rightSideBar =
      isShowingTemplateTagsEditor && query instanceof NativeQuery ? (
        <TagEditorSidebar
          {...propsWithExtras}
          onClose={() => this.props.toggleTemplateTagsEditor()}
        />
      ) : isShowingDataReference ? (
        <DataReference
          {...propsWithExtras}
          onClose={() => this.props.toggleDataReference()}
        />
      ) : null;

    return (
      <div className={this.props.fitClassNames}>
        <div className={cx("QueryBuilder flex flex-column bg-white spread")}>
          <ViewTitleHeader {...propsWithExtras} className="flex-no-shrink" />

          <div className="flex flex-full">
            <ViewSidebar left isOpen={!!leftSideBar}>
              {leftSideBar}
            </ViewSidebar>

            <div className="flex-full flex flex-column">
              {query instanceof NativeQuery && (
                <div className="z2 hide sm-show border-bottom">
                  <NativeQueryEditor
                    {...propsWithExtras}
                    isOpen={!card.dataset_query.native.query || isDirty}
                    datasetQuery={card && card.dataset_query}
                  />
                </div>
              )}

              {query instanceof StructuredQuery &&
                queryBuilderMode === "notebook" && (
                  <div className="z2 hide sm-show mb1 mt2">
                    <div className="wrapper">
                      <GuiQueryEditor {...propsWithExtras} />
                    </div>
                  </div>
                )}

              <ViewSubHeader {...propsWithExtras} />

              <DebouncedFrame className="flex-full" style={{ flexGrow: 1 }}>
                <QueryVisualization
                  {...propsWithExtras}
                  onAddSeries={onAddSeries}
                  onEditSeries={onEditSeries}
                  onRemoveSeries={onRemoveSeries}
                  onEditBreakout={onEditBreakout}
                  noHeader
                  className="spread"
                />
              </DebouncedFrame>

              {ModeFooter && (
                <ModeFooter {...propsWithExtras} className="flex-no-shrink" />
              )}

              <ViewFooter {...this.props} className="flex-no-shrink" />
            </div>

            <ViewSidebar right isOpen={!!rightSideBar}>
              {rightSideBar}
            </ViewSidebar>
          </div>
        </div>

        {isShowingTutorial && (
          <QueryBuilderTutorial onClose={() => this.props.closeQbTutorial()} />
        )}

        {isShowingNewbModal && (
          <SavedQuestionIntroModal
            onClose={() => this.props.closeQbNewbModal()}
          />
        )}

        <QueryModals {...propsWithExtras} />
      </div>
    );
  }
}
