# Creative Writing Portfolio - Local Development

Simple setup to run your writing portfolio on your laptop!

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- That's it! 🎉

## Quick Start (3 Steps!)

### 1. Start Everything

```bash
docker-compose up -d
```

That's it! This starts:
- MongoDB database (with persistent storage)
- Backend API server
- Automatically initializes default admin user and sample pieces

### 2. Open Your Site

Open your browser and go to:
```
http://localhost:3000/writing-portfolio.html
```

### 3. Login to Admin Panel

Click the "admin" link in the corner, then login:
- **Username**: `admin`
- **Password**: `writing123`

## Common Commands

### Start the site
```bash
docker-compose up -d
```

### Stop the site
```bash
docker-compose down
```

### Stop AND delete all data (fresh start)
```bash
docker-compose down -v
```

### View logs
```bash
# All logs
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just database
docker-compose logs -f mongodb
```

### Restart after making changes
```bash
docker-compose restart backend
```

## File Structure

```
.
├── docker-compose.yml          # This file orchestrates everything
├── backend/
│   ├── server.js              # API server
│   ├── package.json           # Dependencies
│   ├── Dockerfile             # How to build the backend
│   └── public/                # Your HTML files
│       ├── writing-portfolio.html
│       ├── login.html
│       └── admin-panel.html
└── README-LOCAL.md            # This file
```

## How It Works

1. **Docker Compose** starts two containers:
   - MongoDB: Stores your writing pieces
   - Backend: Serves your HTML files + API

2. **Data Persistence**: Your writing pieces are saved in a Docker volume
   - Even if you stop containers, data persists
   - Only deleted with `docker-compose down -v`

3. **Port 3000**: Everything runs on http://localhost:3000

## Customization

### Change the Port

Edit `docker-compose.yml`:
```yaml
backend:
  ports:
    - "8080:3000"  # Now runs on localhost:8080
```

### Change Admin Password

The password is set when the database is first created. To change it:

1. Delete everything (including data):
```bash
docker-compose down -v
```

2. Edit `backend/server.js` around line 49:
```javascript
const hashedPassword = await bcrypt.hash('YOUR_NEW_PASSWORD', 10);
```

3. Start fresh:
```bash
docker-compose up -d
```

### Add More Sample Pieces

Edit `backend/server.js` starting at line 60 (the `defaultPieces` array).

## Troubleshooting

### Port 3000 already in use
```bash
# Stop whatever is using port 3000, or change the port in docker-compose.yml
docker-compose down
```

### Can't connect to the site
```bash
# Check if containers are running
docker-compose ps

# Should show:
# writing-portfolio-backend   running
# writing-portfolio-db        running
```

### Site is slow or not responding
```bash
# Restart everything
docker-compose restart
```

### Start completely fresh
```bash
# Delete everything and start over
docker-compose down -v
docker-compose up -d
```

### View detailed logs
```bash
docker-compose logs -f backend
```

## Accessing MongoDB Directly

If you want to explore your database:

```bash
# Connect to MongoDB
docker exec -it writing-portfolio-db mongosh writing-portfolio

# View all pieces
db.pieces.find().pretty()

# View users
db.users.find().pretty()

# Exit
exit
```

## Resource Usage

When running:
- **RAM**: ~500MB
- **CPU**: Very low (~5%)
- **Disk**: ~2GB (mostly MongoDB)

## Stopping for the Day

```bash
# Stop but keep your data
docker-compose down

# Start again later
docker-compose up -d
```

Your data persists between stops and starts!

## Backing Up Your Writing

### Export all pieces to a file
```bash
docker exec writing-portfolio-db mongodump \
  --db=writing-portfolio \
  --out=/tmp/backup

docker cp writing-portfolio-db:/tmp/backup ./my-backup
```

### Restore from backup
```bash
docker cp ./my-backup writing-portfolio-db:/tmp/restore

docker exec writing-portfolio-db mongorestore \
  --db=writing-portfolio \
  /tmp/restore/writing-portfolio
```

## Development Workflow

1. **Edit HTML files** in `backend/public/`
2. **Refresh browser** - changes appear immediately
3. **Edit backend code** in `backend/server.js`
4. **Restart**: `docker-compose restart backend`

## Next Steps

- **Deploy to the cloud**: Use the Kubernetes setup in the main README
- **Custom domain**: Add nginx reverse proxy
- **HTTPS**: Use Let's Encrypt certificates
- **Backup automation**: Set up scheduled backups

## Need Help?

Common issues:
- **Docker not running**: Start Docker Desktop
- **Permission errors**: Try `sudo docker-compose up -d`
- **Port conflicts**: Change port in `docker-compose.yml`

## Cleaning Up Completely

When you're done and want to remove everything:

```bash
# Stop and remove containers + volumes + networks
docker-compose down -v

# Remove the Docker images
docker rmi writing-portfolio-backend mongo:7
```

This frees up all disk space used by the project.

---

**That's it!** You now have a fully functional writing portfolio running on your laptop. 🎉
