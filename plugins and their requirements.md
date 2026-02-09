**Actions**

- plugin-service-provider: Threads
  Auth: OAuth 2.0  
  function: Create a text post  
  required_config_data: Text content

- plugin-service-provider: Threads
  Auth: OAuth 2.0  
  function: Create a link post  
  required_config_data: Link URL

- plugin-service-provider: Threads
  Auth: OAuth 2.0  
  function: Create an image post  
  required_config_data: Image (URL or file)

- plugin-service-provider: Threads
  Auth: OAuth 2.0  
  function: Create a video post  
  required_config_data: Video (URL or file)

- plugin-service-provider: Threads
  Auth: OAuth 2.0  
  function: Create a carousel (multiple media) post  
  required_config_data: Multiple media (URLs or files)

- plugin-service-provider: Webhooks
  Auth: None, Secret Key  
  function: Make a web request  
  required_config_data: URL, method, payload (optional)

- plugin-service-provider: Google Sheets
  Auth: OAuth 2.0  
  function: Update cell in spreadsheet  
  required_config_data: Spreadsheet ID, worksheet, cell coordinates, value

- plugin-service-provider: Google Sheets
  Auth: OAuth 2.0  
  function: Add row to spreadsheet  
  required_config_data: Spreadsheet ID, worksheet, row values

- plugin-service-provider: Android Device
  Auth: Mobile App Pairing  
  function: Update device wallpaper  
  required_config_data: Image URL

- plugin-service-provider: Android Device
  Auth: Mobile App Pairing  
  function: Play a specific song  
  required_config_data: Song name or identifier

- plugin-service-provider: Android Device
  Auth: Mobile App Pairing  
  function: Play music  
  required_config_data: Music selection (e.g., playlist or song)

- plugin-service-provider: Android Device
  Auth: Mobile App Pairing  
  function: Launch Google Maps Navigation  
  required_config_data: Destination address

- plugin-service-provider: Android Device
  Auth: Mobile App Pairing  
  function: Mute ringtone  
  required_config_data: None

- plugin-service-provider: Android Device
  Auth: Mobile App Pairing  
  function: Set ringtone volume  
  required_config_data: Volume level

- plugin-service-provider: Android Device
  Auth: Mobile App Pairing  
  function: Turn on Do Not Disturb mode  
  required_config_data: None

- plugin-service-provider: Android Device
  Auth: Mobile App Pairing  
  function: Turn off Do Not Disturb mode  
  required_config_data: None

- plugin-service-provider: WhatsApp
  Auth: OAuth 2.0, API Key  
  function: Send a message  
  required_config_data: Text message

- plugin-service-provider: Telegram
  Auth: Bot Token  
  function: Send message  
  required_config_data: Text message

- plugin-service-provider: Telegram
  Auth: Bot Token  
  function: Send photo  
  required_config_data: Photo (file or URL)

- plugin-service-provider: Telegram
  Auth: Bot Token  
  function: Send video  
  required_config_data: Video (file or URL)

- plugin-service-provider: Telegram
  Auth: Bot Token  
  function: Send mp3  
  required_config_data: MP3 file or URL

- plugin-service-provider: Email
  Auth: Email Verification, SMTP  
  function: Send me an email  
  required_config_data: HTML content (images/links supported)

- plugin-service-provider: Gmail
  Auth: OAuth 2.0  
  function: Send an email  
  required_config_data: Recipients, content (HTML supported)

- plugin-service-provider: Gmail
  Auth: OAuth 2.0  
  function: Send yourself an email  
  required_config_data: Content (HTML supported)

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: Upload video from URL  
  required_config_data: Video URL

- plugin-service-provider: ClickSend
  Auth: Basic Auth (API Key)  
  function: Send SMS  
  required_config_data: Phone number, message

- plugin-service-provider: Notifications
  Auth: Mobile App Pairing  
  function: Send a notification  
  required_config_data: Message

- plugin-service-provider: Notifications
  Auth: Mobile App Pairing  
  function: Send a rich notification  
  required_config_data: Title, message, image, link

- plugin-service-provider: Notifications
  Auth: Mobile App Pairing  
  function: Send a rich notification to the IFTTT mobile widget  
  required_config_data: Title, message, image, link

- plugin-service-provider: LinkedIn
  Auth: OAuth 2.0  
  function: Share an update  
  required_config_data: Text update

- plugin-service-provider: LinkedIn
  Auth: OAuth 2.0  
  function: Share a link  
  required_config_data: Link URL

- plugin-service-provider: LinkedIn
  Auth: OAuth 2.0  
  function: Share an update with image  
  required_config_data: Text, image

- plugin-service-provider: LinkedIn
  Auth: OAuth 2.0  
  function: Share an update with video  
  required_config_data: Text, video

- plugin-service-provider: Google Calendar
  Auth: OAuth 2.0  
  function: Quick add event  
  required_config_data: Event description

- plugin-service-provider: Google Calendar
  Auth: OAuth 2.0  
  function: Create a detailed event  
  required_config_data: Title, time, description, location

- plugin-service-provider: Android SMS
  Auth: Mobile App Pairing  
  function: Send an SMS  
  required_config_data: Phone number, message

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Create new Gist  
  required_config_data: Gist content/files

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Create an issue/pull request comment  
  required_config_data: Repository, issue/PR number, comment text

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Create an issue  
  required_config_data: Repository, title, body

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: Post a tweet  
  required_config_data: Tweet text

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: Post a tweet with image  
  required_config_data: Tweet text, image

**Triggers**

- plugin-service-provider: Blogger
  Auth: OAuth 2.0  
  function: Any new post  
  output: PostTitle, PostUrl, PostContent, PostImageUrl, Labels, PostPublished
  required_config_data: Blog URL or ID

- plugin-service-provider: Blogger
  Auth: OAuth 2.0  
  function: New post labeled  
  output: PostTitle, PostUrl, PostContent, PostImageUrl, Labels, PostPublished
  required_config_data: Blog URL or ID, label

- plugin-service-provider: Facebook
  Auth: OAuth 2.0  
  function: Any new post by you in area  
  output: PostID, Message, Link, Picture, Place, CreatedTime
  required_config_data: Location

- plugin-service-provider: Facebook
  Auth: OAuth 2.0  
  function: New status message by you  
  output: Message, UpdatedTime, PostID
  required_config_data: None

- plugin-service-provider: Facebook
  Auth: OAuth 2.0  
  function: New status message by you with hashtag  
  output: Message, UpdatedTime, PostID
  required_config_data: Hashtag

- plugin-service-provider: Facebook
  Auth: OAuth 2.0  
  function: New link post by you  
  output: Link, Message, CreatedTime, PostID
  required_config_data: None

- plugin-service-provider: Facebook
  Auth: OAuth 2.0  
  function: New link post by you with hashtag  
  output: Link, Message, CreatedTime, PostID
  required_config_data: Hashtag

- plugin-service-provider: Facebook
  Auth: OAuth 2.0  
  function: New photo post by you  
  output: Picture, Link, Message, CreatedTime, PostID
  required_config_data: None

- plugin-service-provider: Facebook
  Auth: OAuth 2.0  
  function: New photo post by you with hashtag  
  output: Picture, Link, Message, CreatedTime, PostID
  required_config_data: Hashtag

- plugin-service-provider: Facebook
  Auth: OAuth 2.0  
  function: New photo post by you in area  
  output: Picture, Link, Message, Place, CreatedTime, PostID
  required_config_data: Location

- plugin-service-provider: Facebook
  Auth: OAuth 2.0  
  function: You are tagged in a photo  
  output: Link, From, Tags, CreatedTime, ImageSource
  required_config_data: None

- plugin-service-provider: Facebook
  Auth: OAuth 2.0  
  function: Your profile changes  
  output: ProfileUrl, FirstName, LastName, Name, Gender, Locale, Timezone, UpdatedTime
  required_config_data: None

- plugin-service-provider: Spotify
  Auth: OAuth 2.0  
  function: New followed show  
  output: ShowName, ShowUrl, ShowDescription, Publisher, ImageUrl
  required_config_data: None

- plugin-service-provider: Spotify
  Auth: OAuth 2.0  
  function: New saved episode  
  output: EpisodeName, ShowName, EpisodeURL, Description, PublishDate
  required_config_data: None

- plugin-service-provider: Spotify
  Auth: OAuth 2.0  
  function: New saved track  
  output: TrackName, ArtistName, AlbumName, TrackURL, AddedAt
  required_config_data: None

- plugin-service-provider: Spotify
  Auth: OAuth 2.0  
  function: New show from search  
  output: ShowName, ShowUrl, ShowDescription, Publisher, ImageUrl
  required_config_data: Search query

- plugin-service-provider: Spotify
  Auth: OAuth 2.0  
  function: New recently played track  
  output: TrackName, ArtistName, AlbumName, TrackURL, PlayedAt
  required_config_data: None

- plugin-service-provider: Spotify
  Auth: OAuth 2.0  
  function: New saved album  
  output: AlbumName, ArtistName, AlbumURL, AddedAt
  required_config_data: None

- plugin-service-provider: Spotify
  Auth: OAuth 2.0  
  function: New episode from followed show  
  output: EpisodeName, ShowName, EpisodeURL, Description, PublishDate
  required_config_data: None

- plugin-service-provider: Spotify
  Auth: OAuth 2.0  
  function: New episode from search  
  output: EpisodeName, ShowName, EpisodeURL, Description, PublishDate
  required_config_data: Search query

- plugin-service-provider: Spotify
  Auth: OAuth 2.0  
  function: New track added to a playlist  
  output: TrackName, ArtistName, AlbumName, TrackURL, AddedAt, AddedBy
  required_config_data: Playlist name or ID

- plugin-service-provider: WhatsApp
  Auth: OAuth 2.0, API Key  
  function: You sent a specific WhatsApp message to InOut  
  output: MessageText, Sender, Timestamp
  required_config_data: Specific message or key phrase

- plugin-service-provider: WhatsApp
  Auth: OAuth 2.0, API Key  
  function: You sent any WhatsApp message to InOut  
  output: MessageText, Sender, Timestamp
  required_config_data: None

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: New video from search  
  output: Title, Description, Url, AuthorName, PublishedAt
  required_config_data: Search query

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: New liked video  
  output: Title, Description, Url, AuthorName, LikedAt
  required_config_data: None

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: You subscribe to a channel  
  output: ChannelName, ChannelUrl, Description
  required_config_data: None

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: New video by channel  
  output: Title, Description, Url, AuthorName, PublishedAt
  required_config_data: Channel name or ID

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: New playlist  
  output: Title, Description, Url, PublishedAt
  required_config_data: None

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: New public video uploaded by you  
  output: Title, Description, Url, EmbedCode, PublishedAt
  required_config_data: None

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: New public video from subscriptions  
  output: Title, Description, Url, AuthorName, PublishedAt
  required_config_data: None

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: New Super Chat message  
  output: Message, AuthorName, Amount, Currency, PublishedAt
  required_config_data: None

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: New channel membership  
  output: MemberName, Level, JoinedAt
  required_config_data: None

- plugin-service-provider: YouTube
  Auth: OAuth 2.0  
  function: New Super Sticker  
  output: StickerUrl, AuthorName, Amount, Currency, PublishedAt
  required_config_data: None

- plugin-service-provider: Telegram
  Auth: Bot Token  
  function: New message with key phrase to @IFTTT  
  output: Text, SenderName, Username, Date
  required_config_data: Key phrase

- plugin-service-provider: Telegram
  Auth: Bot Token  
  function: New photo to @IFTTT  
  output: PhotoUrl, Caption, SenderName, Date
  required_config_data: None

- plugin-service-provider: Telegram
  Auth: Bot Token  
  function: New message with key phrase in a group  
  output: Text, SenderName, GroupTitle, Date
  required_config_data: Key phrase

- plugin-service-provider: Telegram
  Auth: Bot Token  
  function: New message in a group  
  output: Text, SenderName, GroupTitle, Date
  required_config_data: None

- plugin-service-provider: Telegram
  Auth: Bot Token  
  function: New post in your channel  
  output: Text, ChannelName, Date, PostHtml
  required_config_data: None

- plugin-service-provider: Telegram
  Auth: Bot Token  
  function: New photo in your channel  
  output: PhotoUrl, Caption, ChannelName, Date
  required_config_data: None

- plugin-service-provider: Reddit
  Auth: OAuth 2.0  
  function: Any new post in subreddit  
  output: Title, Content, Author, Subreddit, Url, ImageUrl, PostedAt
  required_config_data: Subreddit name

- plugin-service-provider: Reddit
  Auth: OAuth 2.0  
  function: New hot post in subreddit  
  output: Title, Content, Author, Subreddit, Url, ImageUrl, PostedAt
  required_config_data: Subreddit name

- plugin-service-provider: Reddit
  Auth: OAuth 2.0  
  function: New top post in subreddit  
  output: Title, Content, Author, Subreddit, Url, ImageUrl, PostedAt
  required_config_data: Subreddit name

- plugin-service-provider: Reddit
  Auth: OAuth 2.0  
  function: New post from search  
  output: Title, Content, Author, Subreddit, Url, ImageUrl, PostedAt
  required_config_data: Search query

- plugin-service-provider: Reddit
  Auth: OAuth 2.0  
  function: New post by you  
  output: Title, Content, Url, PostedAt
  required_config_data: None

- plugin-service-provider: Reddit
  Auth: OAuth 2.0  
  function: New comment by you  
  output: CommentBody, LinkToComment, PostedAt
  required_config_data: None

- plugin-service-provider: Reddit
  Auth: OAuth 2.0  
  function: New upvoted post by you  
  output: Title, Content, Author, Subreddit, Url, PostedAt
  required_config_data: None

- plugin-service-provider: Reddit
  Auth: OAuth 2.0  
  function: New downvoted post by you  
  output: Title, Content, Author, Subreddit, Url, PostedAt
  required_config_data: None

- plugin-service-provider: Reddit
  Auth: OAuth 2.0  
  function: New post saved by you  
  output: Title, Content, Author, Subreddit, Url, PostedAt
  required_config_data: None

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: New tweet by you  
  output: Text, LinkToTweet, CreatedAt, TweetEmbedCode
  required_config_data: None

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: New tweet by you with hashtag  
  output: Text, LinkToTweet, CreatedAt, TweetEmbedCode
  required_config_data: Hashtag

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: New tweet by you in area  
  output: Text, LinkToTweet, Place, CreatedAt
  required_config_data: Area/location

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: New mention of you  
  output: Text, UserName, LinkToTweet, CreatedAt
  required_config_data: None

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: New link by you  
  output: Text, LinkToTweet, Link, CreatedAt
  required_config_data: None

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: New follower  
  output: ScreenName, Name, Bio, Location, Url, Protect
  required_config_data: None

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: New liked tweet by you  
  output: Text, UserName, LinkToTweet, CreatedAt
  required_config_data: None

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: New tweet by a specific user  
  output: Text, LinkToTweet, CreatedAt
  required_config_data: Username

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: New tweet from search  
  output: Text, UserName, LinkToTweet, CreatedAt
  required_config_data: Search query

- plugin-service-provider: X.com
  Auth: OAuth 2.0, OAuth 1.0a  
  function: New tweet by anyone in area  
  output: Text, UserName, LinkToTweet, Place, CreatedAt
  required_config_data: Area/location

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Any new notification from a repository  
  output: Repository, Title, Url, Type, Date
  required_config_data: Repository

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Any new repository event  
  output: EventType, Repository, Actor, Date
  required_config_data: Repository

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Any new release  
  output: TagName, ReleaseName, Body, PublishedAt, Url
  required_config_data: Repository

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Any new commit  
  output: Message, Author, Url, Date, Sha
  required_config_data: Repository

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Any new notification  
  output: Repository, Title, Url, Type, Date
  required_config_data: None

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Any new Gist  
  output: Description, Url, CreatedAt, Owner
  required_config_data: None

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Any new issue  
  output: IssueTitle, IssueBody, IssueUrl, User, CreatedAt
  required_config_data: None

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: Any new closed issue  
  output: IssueTitle, IssueBody, IssueUrl, User, ClosedAt
  required_config_data: None

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: New issue assigned to you  
  output: IssueTitle, IssueBody, IssueUrl, User, AssignedAt
  required_config_data: None

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: New repository by a specific username or organization  
  output: RepositoryName, Description, Url, Owner, CreatedAt
  required_config_data: Username or organization

- plugin-service-provider: GitHub
  Auth: OAuth 2.0, Personal Access Token  
  function: New pull request for a specific repository  
  output: Title, Body, Url, User, CreatedAt
  required_config_data: Repository

- plugin-service-provider: Date & Time
  Auth: None  
  function: Every day at  
  output: CheckTime
  required_config_data: Specific time

- plugin-service-provider: Date & Time
  Auth: None  
  function: Every hour at  
  output: CheckTime
  required_config_data: Specific time

- plugin-service-provider: Date & Time
  Auth: None  
  function: Every day of the week at  
  output: CheckTime
  required_config_data: Day of week, time

- plugin-service-provider: Date & Time
  Auth: None  
  function: Every month on the  
  output: CheckTime
  required_config_data: Day of month, time

- plugin-service-provider: Date & Time
  Auth: None  
  function: Every year on  
  output: CheckTime
  required_config_data: Date, time

- plugin-service-provider: SoundCloud
  Auth: OAuth 2.0  
  function: Any new public track  
  output: Title, Url, ArtworkUrl, Description, Genre, CreatedAt
  required_config_data: None

- plugin-service-provider: SoundCloud
  Auth: OAuth 2.0  
  function: New public like  
  output: Title, Url, ArtworkUrl, Username, CreatedAt
  required_config_data: None

- plugin-service-provider: SoundCloud
  Auth: OAuth 2.0  
  function: New public track by anyone you follow  
  output: Title, Url, ArtworkUrl, Description, Genre, CreatedAt
  required_config_data: None

- plugin-service-provider: SoundCloud
  Auth: OAuth 2.0  
  function: New track from search  
  output: Title, Url, ArtworkUrl, Description, Genre, CreatedAt
  required_config_data: Search query

- plugin-service-provider: SoundCloud
  Auth: OAuth 2.0  
  function: Any new follower  
  output: Username, ProfileUrl, AvatarUrl
  required_config_data: None

- plugin-service-provider: SoundCloud
  Auth: OAuth 2.0  
  function: New playlist created  
  output: Title, Url, ArtworkUrl, Description, CreatedAt
  required_config_data: None

- plugin-service-provider: SoundCloud
  Auth: OAuth 2.0  
  function: New track in a playlist  
  output: Title, Url, ArtworkUrl, PlaylistName
  required_config_data: Playlist

- plugin-service-provider: Email
  Auth: Email Verification, SMTP  
  function: Send IFTTT any email  
  output: Subject, Body, From, ReceivedAt, AttachmentUrl
  required_config_data: None

- plugin-service-provider: Email
  Auth: Email Verification, SMTP  
  function: Send IFTTT an email tagged  
  output: Subject, Body, From, ReceivedAt, AttachmentUrl
  required_config_data: Hashtag in subject

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: Daily activity summary  
  output: Date, TotalSteps, CaloriesBurned, Distance, Floors, SedentaryMinutes, VeryActiveMinutes
  required_config_data: None

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: Daily step goal achieved  
  output: TotalSteps, Date, Goal
  required_config_data: None

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: Daily distance goal achieved  
  output: TotalDistance, Date, Goal
  required_config_data: None

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: Daily floors climbed goal achieved  
  output: TotalFloors, Date, Goal
  required_config_data: None

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: Daily calorie burn goal achieved  
  output: CaloriesBurned, Date, Goal
  required_config_data: None

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: Daily very active minutes goal achieved  
  output: VeryActiveMinutes, Date, Goal
  required_config_data: None

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: Daily goal not achieved by  
  output: GoalType, CurrentValue, TargetValue, Time
  required_config_data: Time

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: New weight logged  
  output: Weight, Date, BMI
  required_config_data: None

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: New sleep logged  
  output: StartTime, EndTime, TimeAsleep, Efficiency
  required_config_data: None

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: Sleep duration above  
  output: StartTime, EndTime, TimeAsleep
  required_config_data: Target hours

- plugin-service-provider: Fitbit
  Auth: OAuth 2.0  
  function: Sleep duration below  
  output: StartTime, EndTime, TimeAsleep
  required_config_data: Target hours

- plugin-service-provider: Google Drive
  Auth: OAuth 2.0  
  function: New file in your folder  
  output: Filename, FileUrl, MimeType, CreatedDate
  required_config_data: Folder path

- plugin-service-provider: Google Drive
  Auth: OAuth 2.0  
  function: New file from search in your folder  
  output: Filename, FileUrl, MimeType, CreatedDate
  required_config_data: Search query, folder path

- plugin-service-provider: Google Drive
  Auth: OAuth 2.0  
  function: New photo in your folder  
  output: Filename, FileUrl, CreatedDate
  required_config_data: Folder path

- plugin-service-provider: Google Drive
  Auth: OAuth 2.0  
  function: New video in your folder  
  output: Filename, FileUrl, CreatedDate
  required_config_data: Folder path

- plugin-service-provider: Google Drive
  Auth: OAuth 2.0  
  function: New starred file in folder  
  output: Filename, FileUrl, MimeType, CreatedDate
  required_config_data: Folder path

- plugin-service-provider: Google Sheets
  Auth: OAuth 2.0  
  function: New spreadsheet added to folder  
  output: Title, SpreadsheetUrl, CreatedDate
  required_config_data: Folder path

- plugin-service-provider: Google Sheets
  Auth: OAuth 2.0  
  function: New worksheet in spreadsheet  
  output: Title, WorksheetName, CreatedDate
  required_config_data: Spreadsheet ID

- plugin-service-provider: Google Sheets
  Auth: OAuth 2.0  
  function: New row added to spreadsheet  
  output: RowNumber, ColumnValues, CreatedAt
  required_config_data: Spreadsheet ID

- plugin-service-provider: Google Sheets
  Auth: OAuth 2.0  
  function: Cell updated in spreadsheet  
  output: Row, Column, Value, UpdatedAt
  required_config_data: Spreadsheet ID

- plugin-service-provider: Threads
  Auth: OAuth 2.0  
  function: Any new post by you  
  output: Text, Url, CreatedAt
  required_config_data: None

- plugin-service-provider: Threads
  Auth: OAuth 2.0  
  function: New text post by you  
  output: Text, Url, CreatedAt
  required_config_data: None

- plugin-service-provider: Threads
  Auth: OAuth 2.0  
  function: New image post by you  
  output: Text, ImageUrl, Url, CreatedAt
  required_config_data: None

- plugin-service-provider: Threads
  Auth: OAuth 2.0  
  function: New video post by you  
  output: Text, VideoUrl, Url, CreatedAt
  required_config_data: None

- plugin-service-provider: Threads
  Auth: OAuth 2.0  
  function: New carousel post by you  
  output: Text, CarouselMediaUrls, Url, CreatedAt
  required_config_data: None

- plugin-service-provider: RSS Feed
  Auth: None  
  function: New feed item  
  output: EntryTitle, EntryUrl, EntryAuthor, EntryContent, EntryPublished
  required_config_data: Feed URL

- plugin-service-provider: RSS Feed
  Auth: None  
  function: New feed item matches  
  output: EntryTitle, EntryUrl, EntryAuthor, EntryContent, EntryPublished
  required_config_data: Feed URL, keyword or phrase

- plugin-service-provider: Google Calendar
  Auth: OAuth 2.0  
  function: New event added  
  output: Title, Description, Location, StartTime, EndTime, EventUrl
  required_config_data: None

- plugin-service-provider: Google Calendar
  Auth: OAuth 2.0  
  function: New event from search added  
  output: Title, Description, Location, StartTime, EndTime, EventUrl
  required_config_data: Search query

- plugin-service-provider: Google Calendar
  Auth: OAuth 2.0  
  function: Any event starts  
  output: Title, Description, Location, StartTime, EndTime, EventUrl
  required_config_data: None

- plugin-service-provider: Google Calendar
  Auth: OAuth 2.0  
  function: Event from search starts  
  output: Title, Description, Location, StartTime, EndTime, EventUrl
  required_config_data: Search query

- plugin-service-provider: Google Calendar
  Auth: OAuth 2.0  
  function: Any event ends  
  output: Title, Description, Location, StartTime, EndTime, EventUrl
  required_config_data: None

- plugin-service-provider: Google Calendar
  Auth: OAuth 2.0  
  function: Event from search ends  
  output: Title, Description, Location, StartTime, EndTime, EventUrl
  required_config_data: Search query

- plugin-service-provider: Google Calendar
  Auth: OAuth 2.0  
  function: You respond to an event invite  
  output: Title, Response, EventUrl, StartTime
  required_config_data: None

- plugin-service-provider: Webhooks
  Auth: None, Secret Key  
  function: Receive a web request with a JSON payload  
  output: JsonPayload, EventName, OccurredAt
  required_config_data: None (URL generated)

- plugin-service-provider: Webhooks
  Auth: None, Secret Key  
  function: Receive a web request  
  output: EventName, OccurredAt
  required_config_data: None (URL generated)

- plugin-service-provider: Instagram
  Auth: OAuth 2.0  
  function: Any new photo by you  
  output: Caption, Url, SourceUrl, CreatedAt
  required_config_data: None

- plugin-service-provider: Instagram
  Auth: OAuth 2.0  
  function: New photo by you with specific hashtag  
  output: Caption, Url, SourceUrl, CreatedAt
  required_config_data: Hashtag

- plugin-service-provider: Instagram
  Auth: OAuth 2.0  
  function: Any new video by you  
  output: Caption, Url, SourceUrl, CreatedAt
  required_config_data: None

- plugin-service-provider: Instagram
  Auth: OAuth 2.0  
  function: New video by you with specific hashtag  
  output: Caption, Url, SourceUrl, CreatedAt
  required_config_data: Hashtag