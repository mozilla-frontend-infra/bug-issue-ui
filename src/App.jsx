import { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import Typography from 'material-ui/Typography';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Hidden from 'material-ui/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import './App.css';
import data from './data.yaml';
import projectGroups from './data/loader';

// styles
const drawerWidth = 240;
const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 50,
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  appBarTitle: {
    fontFamily: 'Roboto300',
  },
  drawerPaper: {
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
    width: drawerWidth,
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  formControlLabel: {
    display: 'flex',
    align: 'center',
    marginLeft: 0,
  },
  toolbar: theme.mixins.toolbar,
});
const bugType = ['Unassigned Bug', 'Assigned Bugs', 'Simple Bugs'];

class App extends Component {
  constructor(props) {
    super(props);

    const projectSelections = {};

    Object.entries(projectGroups).forEach(projectGroup => {
      projectGroup[1].forEach(
        project => (projectSelections[project.fileName] = false)
      );
    });

    this.state = {
      mobileOpen: false,
      projectGroups,
      projectSelections,
    };
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  handleCheckboxToggle = ({ currentTarget: { id } }) => {
    const { projectSelections } = this.state;

    projectSelections[id] = !projectSelections[id];
    this.setState({ projectSelections });
  };

  render() {
    const { classes, theme } = this.props;
    const { projectGroups, projectSelections } = this.state;
    const drawer = (
      <div>
        <div className={classes.toolbar} />
        <Typography>Are you interested in:</Typography>
        {Object.entries(projectGroups).map(([group, projects]) => (
          <List key={group}>
            <ListItem>
              <ListItemText>{group}</ListItemText>
            </ListItem>
            {projects.map(project => (
              <ListItem
                key={`${group}-${project.fileName}`}
                id={project.fileName}
                onClick={this.handleCheckboxToggle}
                button>
                <Checkbox
                  value={project.fileName}
                  checked={projectSelections[project.fileName]}
                />
                <ListItemText primary={project.name} />
              </ListItem>
            ))}
          </List>
        ))}

        <Typography>Do you know ?</Typography>
        <List>
          {data.Languages.map(lang => (
            <ListItem key={lang} id={lang} button>
              <Checkbox value={lang} />
              <ListItemText primary={lang} />
            </ListItem>
          ))}

          <Typography>Filter result on:</Typography>
          {bugType.map(bug => (
            <ListItem key={bug} id={bug} button>
              <Checkbox value={bug} />
              <ListItemText primary={bug} />
            </ListItem>
          ))}
        </List>
      </div>
    );

    return (
      <div className={classes.root}>
        <AppBar position="absolute" className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerToggle}
              className={classes.navIconHide}>
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" noWrap>
              BugsAhoy
            </Typography>
          </Toolbar>
        </AppBar>
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={this.state.mobileOpen}
            onClose={this.handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,
            }}>
            {drawer}
          </Drawer>
        </Hidden>

        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: classes.drawerPaper,
            }}>
            {drawer}
          </Drawer>
        </Hidden>

        <main className={classes.content}>
          <div className={classes.toolbar} />

          {/* this is the place for project description, 
          i was thinking of using a auto moving carousel / modal */}
          <Typography variant="subheading">
            Projects selected description ( as a carousel later)
          </Typography>

          <Divider />
          {/* this is the place for bugs */}
          <Typography variant="subheading">Bugs (list/ table)</Typography>
        </main>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(App);
