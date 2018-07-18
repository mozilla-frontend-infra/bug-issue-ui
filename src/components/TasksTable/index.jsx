import { Component, Fragment } from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Chip from '@material-ui/core/Chip';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import LinkIcon from 'mdi-react/LinkIcon';
import InformationVariantIcon from 'mdi-react/InformationVariantIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import { withRouter } from 'react-router-dom';
import { arrayOf, object } from 'prop-types';
import { camelCase } from 'change-case';
import Divider from '@material-ui/core/Divider';
import TableLargeIcon from 'mdi-react/TableLargeIcon';
import TableColumnIcon from 'mdi-react/TableColumnIcon';
import AccountIcon from 'mdi-react/AccountIcon';
import { formatDistance, differenceInCalendarDays } from 'date-fns';
import ArrowDownIcon from 'mdi-react/ArrowDownIcon';
import ArrowUpIcon from 'mdi-react/ArrowUpIcon';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { memoizeWith, omit, pipe, sort as rSort, map } from 'ramda';
import { stringify, parse } from 'qs';
import classNames from 'classnames';
import DataTable from '../DataTable';
import sort from '../../utils/sort';
import DataCard from '../DataCard';
import { unassigned, assigned } from '../../utils/assignmentFilters';
import { ASSIGNEE, ALL_PROJECTS, PROJECT_HEADERS } from '../../utils/constants';

const getTaskHelperText = item => {
  const daysSinceLastUpdate = differenceInCalendarDays(
    new Date(),
    item.lastUpdated
  );

  if (item.assignee === '-' && daysSinceLastUpdate < 90) {
    return 'The task is assigned to nobody. Ask in the comments to have it assigned to you.';
  } else if (item.assignee === '-') {
    return 'The task is assigned to nobody but a few months have passed. Ask in the comments if this task is still relevant to tackle and whether you could have it assigned to you.';
  } else if (daysSinceLastUpdate > 30) {
    return 'The task is assigned but has not been touched for over a month. Ask in the comments if you can have it assigned to you.';
  }

  return `This was recently assigned to ${item.assignee}.`;
};

const sorted = pipe(
  rSort((a, b) => sort(a.summary, b.summary)),
  map(({ project, summary }) => `${summary}-${project}`)
);
const assignments = Object.values(ASSIGNEE);

@withRouter
@withStyles(theme => ({
  summary: {
    display: 'inline-block',
    width: 450,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  clickedChip: {
    backgroundColor: theme.palette.secondary.dark,
    '&:focus': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  tableCell: {
    whiteSpace: 'nowrap',
  },
  summaryItem: {
    marginLeft: -theme.spacing.unit,
    padding: theme.spacing.unit,
  },
  dropdown: {
    minWidth: 200,
    marginRight: 2 * theme.spacing.unit,
  },
  filter: {
    ...theme.mixins.gutters(),
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: theme.spacing.unit,
  },
  link: {
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  title: {
    flex: 1,
  },
  summaryText: {
    whitespace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.secondary.contrastText,
  },
  toolbar: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cardTitle: {
    width: '100%',
  },
  cardDescription: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  cardSummaryItem: {
    padding: `${theme.spacing.unit}px ${2 * theme.spacing.unit}px`,
    whiteSpace: 'nowrap',
  },
  icon: {
    flexShrink: 0,
  },
  infoButton: {
    marginRight: theme.spacing.unit,
    marginLeft: -2 * theme.spacing.unit,
  },
  drawerPaper: {
    width: 400,
    maxWidth: '100%',
  },
  drawerCloseButton: {
    position: 'absolute',
    right: theme.spacing.unit,
    top: theme.spacing.unit,
    zIndex: theme.zIndex.drawer + 1,
  },
  cardItem: {
    padding: `0px ${2 * theme.spacing.unit}px`,
  },
  arrowIcon: {
    verticalAlign: 'text-bottom',
    marginRight: theme.spacing.unit / 2,
  },
  cardInfoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.drawer + 1,
  },
  cardChip: {
    marginRight: 41,
  },
}))
export default class TasksTable extends Component {
  state = {
    displayCardLayout: false,
    drawerOpen: false,
    drawerItem: null,
  };

  static propTypes = {
    /**
     * A list of objects to display. Each element in the list is represented
     * by a row and each element's key-value pair represents a column.
     */
    items: arrayOf(object).isRequired,
  };

  getTableData = memoizeWith(
    (
      sortBy = 'Last Updated',
      sortDirection = 'desc',
      tag,
      items,
      assignee,
      project
    ) => {
      const ids = sorted(items);

      return `${ids.join(
        '-'
      )}-${sortBy}-${sortDirection}-${tag}-${assignee}-${project}`;
    },
    (
      sortBy = PROJECT_HEADERS.LAST_UPDATED,
      sortDirection = 'desc',
      tag,
      items,
      assignee,
      project
    ) => {
      const sortByProperty = camelCase(sortBy);
      let filteredItems = [];

      if (assignee === ASSIGNEE.ANY) {
        filteredItems = items;
      } else if (assignee === ASSIGNEE.ASSIGNED) {
        filteredItems = items.filter(assigned);
      } else {
        filteredItems = items.filter(unassigned);
      }

      return filteredItems
        .filter(
          item =>
            (!tag || item.tags.includes(tag)) &&
            (!project || project === ALL_PROJECTS || item.project === project)
        )
        .sort((a, b) => {
          const firstElement =
            sortDirection === 'desc' ? b[sortByProperty] : a[sortByProperty];
          const secondElement =
            sortDirection === 'desc' ? a[sortByProperty] : b[sortByProperty];

          return sort(firstElement, secondElement);
        });
    }
  );

  getQuery() {
    const { location } = this.props;
    const query = parse(location.search.slice(1));

    return query;
  }

  setQuery = query => {
    this.props.history.push({
      search: `?${stringify(query)}`,
    });
  };

  handleFilterChange = ({ target: { name, value } }) => {
    const query = this.getQuery();

    this.setQuery({ ...query, [name]: value });
  };

  handleSortChange = sortBy => {
    if (sortBy === PROJECT_HEADERS.TAGS) {
      return;
    }

    const query = this.getQuery();
    const toggled = query.sortDirection === 'desc' ? 'asc' : 'desc';
    const sortDirection = query.sortBy === sortBy ? toggled : 'desc';

    this.setQuery({ ...query, sortBy, sortDirection });
  };

  handleTagClick = ({ currentTarget }) => {
    const tag = currentTarget.getAttribute('name');
    const query = this.getQuery();
    const newQuery =
      query.tag === tag ? omit(['tag'], query) : { ...query, tag };

    this.setQuery(newQuery);
  };

  handleRandomTaskClick = () => {
    const { items } = this.props;
    const unassignedItems = items.filter(unassigned);
    const url = unassignedItems.length
      ? unassignedItems[Math.floor(Math.random() * unassignedItems.length)].url
      : items[Math.floor(Math.random() * items.length)].url;

    if (url) {
      Object.assign(window.open(), {
        opener: null,
        location: url,
        target: '_blank',
      });
    }
  };

  handleResetClick = () => {
    this.setQuery({});
  };

  handleViewOptionsClick = event => {
    this.setState({ displayCardLayout: event.target.value === 'true' });
  };

  handleSortBy = ({ target: { value } }) => {
    this.handleSortChange(value);
  };

  handleDrawerOpen = ({ target: { name } }) => {
    memoizeWith(
      name => name,
      name =>
        this.setState({
          drawerOpen: true,
          drawerItem: this.props.items.find(item => item.summary === name),
        })
    )(name);
  };

  handleDrawerClose = () => {
    this.setState({
      drawerOpen: false,
      drawerItem: null,
    });
  };

  renderCard = data => {
    const { classes } = this.props;
    const query = this.getQuery();
    const iconSize = 14;

    return (
      <DataCard
        items={data}
        renderRow={item => (
          <Fragment>
            <List
              disablePadding
              className={classNames(classes.summary, classes.cardTitle)}>
              <ListItem
                classes={{ gutters: classes.cardSummaryItem }}
                title={item.summary}
                button
                target="_blank"
                rel="noopener noreferrer"
                component="a"
                href={item.url}>
                <ListItemText
                  primary={
                    <div className={classes.summaryText}>{item.summary}</div>
                  }
                />
                <LinkIcon size={iconSize} />
              </ListItem>
            </List>
            <Divider light />
            <div className={classes.cardItem}>
              <Typography component="div" className={classes.cardDescription}>
                <div>Project:{item.project}</div>
                <div>
                  <AccountIcon className={classes.arrowIcon} size={iconSize} />
                  <strong>{item.assignee}</strong>
                </div>
              </Typography>
              <Typography gutterBottom>
                Last Updated:{' '}
                {formatDistance(item.lastUpdated, new Date(), {
                  addSuffix: true,
                })}
              </Typography>
              <div className={classes.cardChip}>
                {item.tags.map(tag => (
                  <Chip
                    name={tag}
                    key={tag}
                    label={tag}
                    className={classNames({
                      [classes.clickedChip]: tag === query.tag,
                    })}
                    onClick={this.handleTagClick}
                  />
                ))}
              </div>
            </div>
            <IconButton
              name={item.summary}
              className={classes.cardInfoButton}
              onClick={this.handleDrawerOpen}>
              <InformationVariantIcon />
            </IconButton>
          </Fragment>
        )}
      />
    );
  };
  render() {
    const { items, classes } = this.props;
    const { drawerOpen, drawerItem, displayCardLayout } = this.state;
    const query = this.getQuery();
    const { sortBy, sortDirection, tag, assignee, project } = query;
    const assignment = assignments.includes(assignee)
      ? assignee
      : ASSIGNEE.UNASSIGNED;
    const data = this.getTableData(
      sortBy,
      sortDirection,
      tag,
      items,
      assignee,
      project
    );
    const iconSize = 14;
    const projects = [...new Set(items.map(item => item.project))];
    const headers = Object.values(PROJECT_HEADERS);

    return (
      <Fragment>
        <Toolbar className={classes.toolbar}>
          <Typography variant="title" className={classes.title}>
            Bugs & Issues
          </Typography>
          <Hidden smDown>
            <IconButton
              value={!displayCardLayout}
              onClick={this.handleViewOptionsClick}>
              {displayCardLayout ? <TableLargeIcon /> : <TableColumnIcon />}
            </IconButton>
          </Hidden>
          <Button
            color="primary"
            disabled={!items.length}
            onClick={this.handleRandomTaskClick}>
            I’m Feeling Adventurous
          </Button>
        </Toolbar>
        <div className={classes.filter}>
          <TextField
            select
            name="assignee"
            label="Assignee"
            value={assignment}
            className={classes.dropdown}
            onChange={this.handleFilterChange}>
            {assignments.map(assignee => (
              <MenuItem key={assignee} value={assignee}>
                {assignee}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            name="project"
            label="Project"
            value={project || ALL_PROJECTS}
            className={classes.dropdown}
            onChange={this.handleFilterChange}>
            <MenuItem value={ALL_PROJECTS}>{ALL_PROJECTS}</MenuItem>
            {projects.map(project => (
              <MenuItem key={project} value={project}>
                {project}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Sort by"
            value={sortBy || PROJECT_HEADERS.LAST_UPDATED}
            className={classes.dropdown}
            onChange={this.handleSortBy}>
            {headers
              .filter(header => header !== PROJECT_HEADERS.TAGS)
              .map(header => (
                <MenuItem key={header} value={header}>
                  {header === sortBy &&
                    (sortDirection === 'asc' ? (
                      <ArrowUpIcon className={classes.arrowIcon} size={18} />
                    ) : (
                      <ArrowDownIcon className={classes.arrowIcon} size={18} />
                    ))}
                  {sortBy &&
                    header !== sortBy && (
                      <Fragment>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Fragment>
                    )}
                  {header}
                </MenuItem>
              ))}
          </TextField>
          <Button
            variant="outlined"
            size="small"
            onClick={this.handleResetClick}>
            Reset
          </Button>
        </div>
        <Hidden mdUp>{this.renderCard(data)}</Hidden>
        <Hidden smDown>
          {displayCardLayout ? (
            <Fragment>{this.renderCard(data)}</Fragment>
          ) : (
            <Fragment>
              <div className={classes.tableWrapper}>
                <DataTable
                  items={data}
                  renderRow={item => (
                    <TableRow tabIndex={-1} key={item.summary}>
                      <TableCell
                        component="th"
                        scope="row"
                        className={classes.tableCell}>
                        {item.project}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <IconButton
                          name={item.summary}
                          className={classes.infoButton}
                          onClick={this.handleDrawerOpen}>
                          <InformationVariantIcon />
                        </IconButton>
                        <List disablePadding className={classes.summary}>
                          <ListItem
                            classes={{
                              gutters: classes.summaryItem,
                            }}
                            title={item.summary}
                            button
                            target="_blank"
                            rel="noopener noreferrer"
                            component="a"
                            href={item.url}>
                            <ListItemText
                              secondary={
                                <div className={classes.summaryText}>
                                  {item.summary}
                                </div>
                              }
                            />
                            <LinkIcon
                              className={classes.icon}
                              size={iconSize}
                            />
                          </ListItem>
                        </List>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {item.tags.map(tag => (
                          <Chip
                            name={tag}
                            key={tag}
                            label={tag}
                            className={classNames({
                              [classes.clickedChip]: tag === query.tag,
                            })}
                            onClick={this.handleTagClick}
                          />
                        ))}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {item.assignee}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {formatDistance(item.lastUpdated, new Date(), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  )}
                  headers={headers}
                  sortByHeader={sortBy}
                  sortDirection={sortDirection}
                  onHeaderClick={this.handleSortChange}
                />
              </div>
            </Fragment>
          )}
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={this.handleDrawerClose}
            classes={{ paper: classes.drawerPaper }}>
            <Fragment>
              <IconButton
                className={classes.drawerCloseButton}
                onClick={this.handleDrawerClose}>
                <CloseIcon />
              </IconButton>
              {drawerItem && (
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Summary"
                      secondary={drawerItem.summary}
                    />
                  </ListItem>
                  {drawerItem.description && (
                    <ListItem>
                      <ListItemText
                        primary="Description"
                        secondary={drawerItem.description}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemText
                      primary="Are you interested?"
                      secondary={getTaskHelperText(drawerItem)}
                    />
                  </ListItem>
                </List>
              )}
            </Fragment>
          </Drawer>
        </Hidden>
      </Fragment>
    );
  }
}
