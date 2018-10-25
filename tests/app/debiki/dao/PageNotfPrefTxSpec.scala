/**
 * Copyright (c) 2018 Kaj Magnus Lindberg
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package debiki.dao

import com.debiki.core._
import com.debiki.core.Prelude._
import org.scalatest._
import NotfLevel._

class PageNotfPrefTxSpec extends DaoAppSuite(disableScripts = true, disableBackgroundJobs = true) {
  var dao: SiteDao = _
  var owner: User = _
  var userOne: User = _
  var userTwo: User = _

  var forumPageId: PageId = _
  var defCatId: CategoryId = _
  var otherCatId: CategoryId = _

  var pageIdOne: PageId = _
  var pageIdTwo: PageId = _
  var pageIdThree: PageId = _

  lazy val now: When = globals.now()


  "PageNotPref SiteTransaction fns can  TyT8MKRD25" - {

    "quick notf level tests  TyT7KSJQ296" in {
      PageNotfLevels(
        forPage = Some(Hushed),
        forCategory = Some(WatchingFirst),
        forWholeSite = Some(WatchingAll)).effectiveNotfLevel mustBe Hushed

      PageNotfLevels(
        forPage = None,
        forCategory = Some(WatchingFirst),
        forWholeSite = Some(WatchingAll)).effectiveNotfLevel mustBe WatchingFirst

      PageNotfLevels(
        forPage = None,
        forCategory = None,
        forWholeSite = Some(WatchingAll)).effectiveNotfLevel mustBe WatchingAll

      PageNotfLevels(
        forPage = None,
        forCategory = None,
        forWholeSite = None).effectiveNotfLevel mustBe Normal
    }


    "prepare" in {
      globals.systemDao.getOrCreateFirstSite()
      dao = globals.siteDao(Site.FirstSiteId)
      owner = createPasswordOwner("5kwu8f40", dao)
      userOne = createPasswordUser("pp22xxnn", dao, trustLevel = TrustLevel.BasicMember)
      userTwo = createPasswordUser("jjyyzz55", dao, trustLevel = TrustLevel.BasicMember)

      val createForumResult =
          dao.createForum("Forum", s"/drafts-forum/", isForEmbCmts = false,
            Who(owner.id, browserIdData))

      defCatId = createForumResult.defaultCategoryId
      forumPageId = createForumResult.pagePath.pageId.get

      otherCatId = dao.readWriteTransaction(_.nextCategoryId())
      dao.createCategory(
        CategoryToSave(
          anyId = Some(otherCatId),
          sectionPageId = createForumResult.pagePath.pageId.get,
          parentId = createForumResult.staffCategoryId,
          name = "Category Id Two",
          slug = "categoryIdTwo",
          description = "Descr, cat two",
          position = 11,
          newTopicTypes = List(PageRole.Discussion),
          shallBeDefaultCategory = false,
          unlistCategory = false,
          unlistTopics = false,
          includeInSummaries = IncludeInSummaries.NoExclude),
        Vector(ForumDao.makeEveryonesDefaultCategoryPerms(otherCatId)),
        Who.System)

      pageIdOne = createPage(PageRole.Discussion, dao.textAndHtmlMaker.forTitle("Notfs Test One"),
        bodyTextAndHtml = dao.textAndHtmlMaker.forBodyOrComment("Text text one."),
        authorId = SystemUserId, browserIdData, dao,
        anyCategoryId = Some(defCatId))

      pageIdTwo = createPage(PageRole.Discussion, dao.textAndHtmlMaker.forTitle("Notfs Test Two"),
        bodyTextAndHtml = dao.textAndHtmlMaker.forBodyOrComment("Text text two."),
        authorId = SystemUserId, browserIdData, dao,
        anyCategoryId = Some(defCatId))

      pageIdThree = createPage(PageRole.Discussion, dao.textAndHtmlMaker.forTitle("Notfs Test Three"),
        bodyTextAndHtml = dao.textAndHtmlMaker.forBodyOrComment("Text text three."),
        authorId = SystemUserId, browserIdData, dao,
        anyCategoryId = Some(defCatId))
    }


    "find no people watching" in {
      dao.readOnlyTransaction { tx =>
        tx.loadPeopleIdsWatchingPage(pageIdOne, minNotfLevel = Muted) mustBe Set.empty
        tx.loadPeopleIdsWatchingCategory(defCatId, minNotfLevel = Muted) mustBe Set.empty
        tx.loadPeopleIdsWatchingWholeSite(minNotfLevel = Muted) mustBe Set.empty
      }
    }


    // ----- Pages


    "can config page notf prefs" - {
      "insert notf prefs, for page" in {
        dao.readWriteTransaction { tx =>
          tx.upsertPageNotfPref(PageNotfPref(
            userOne.id,
            pageId = Some(pageIdOne),
            pagesInCategoryId = None,
            notfLevel = EveryPostAllEdits))
        }
      }

      "find again" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdOne, Some(defCatId)) mustBe PageNotfLevels(
            forPage = Some(EveryPostAllEdits),
            forCategory = None,
            forWholeSite = None)
        }
      }

      "... not for the wrong user" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userTwo.id, pageIdOne, Some(defCatId)) mustBe PageNotfLevels(
            forPage = None,
            forCategory = None,
            forWholeSite = None)
        }
      }

      "... not for the wrong page" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdTwo, Some(defCatId)) mustBe PageNotfLevels(
            forPage = None,
            forCategory = None,
            forWholeSite = None)
        }
      }
    }


    "can config notfs prefs for many pages" - {
      "configure" in {
        dao.readWriteTransaction { tx =>
          tx.upsertPageNotfPref(PageNotfPref(
            userOne.id,
            pageId = Some(pageIdTwo),
            pagesInCategoryId = None,
            notfLevel = WatchingAll))
        }
      }

      "find again" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdTwo, Some(defCatId)) mustBe PageNotfLevels(
            forPage = Some(WatchingAll),
            forCategory = None,
            forWholeSite = None)
        }
      }

      "didn't overwrite the 1st page's notf level" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdOne, Some(defCatId)) mustBe PageNotfLevels(
            forPage = Some(EveryPostAllEdits),
            forCategory = None,
            forWholeSite = None)
        }
      }
    }


    "can edit page notf prefs" - {
      "upsert notf prefs, for page one" in {
        dao.readWriteTransaction { tx =>
          tx.upsertPageNotfPref(PageNotfPref(
            userOne.id,
            pageId = Some(pageIdOne),
            pagesInCategoryId = None,
            notfLevel = Hushed))
        }
      }

      "find again" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdOne, Some(defCatId)) mustBe PageNotfLevels(
            forPage = Some(Hushed),
            forCategory = None,
            forWholeSite = None)
        }
      }

      "didn't overwrite the 2nd page's notf level" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdTwo, Some(defCatId)) mustBe PageNotfLevels(
            forPage = Some(WatchingAll),
            forCategory = None,
            forWholeSite = None)
        }
      }
    }


    // ----- Categories


    "can config category notf prefs" - {
      "insert notf prefs, for a category" in {
        dao.readWriteTransaction { tx =>
          tx.upsertPageNotfPref(PageNotfPref(
            userOne.id,
            pageId = None,
            pagesInCategoryId = Some(defCatId),
            notfLevel = TopicProgress))
        }
      }

      "find again" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, Some(defCatId)) mustBe PageNotfLevels(
            forPage = None,
            forCategory = Some(TopicProgress),
            forWholeSite = None)
        }
      }

      "... not for the wrong user" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userTwo.id /*wrong*/, pageIdThree, Some(defCatId)) mustBe
            PageNotfLevels(
              forPage = None,
              forCategory = None,
              forWholeSite = None)
        }
      }

      "... not for the wrong category" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, Some(otherCatId) /* wrong */) mustBe
            PageNotfLevels(
              forPage = None,
              forCategory = None,
              forWholeSite = None)
        }
      }

      "... not for no category at all" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, None) mustBe PageNotfLevels(
            forPage = None,
            forCategory = None,
            forWholeSite = None)
        }
      }
    }


    "can config category notf prefs, for many cats" - {
      "configure" in {
        dao.readWriteTransaction { tx =>
          tx.upsertPageNotfPref(PageNotfPref(
            userOne.id,
            pageId = None,
            pagesInCategoryId = Some(otherCatId),
            notfLevel = TopicSolved))
        }
      }

      "find again" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, Some(otherCatId)) mustBe PageNotfLevels(
            forPage = None,
            forCategory = Some(TopicSolved),
            forWholeSite = None)
        }
      }

      "didn't overwrite the 1st cat's notf level" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, Some(defCatId)) mustBe PageNotfLevels(
            forPage = None,
            forCategory = Some(TopicProgress),
            forWholeSite = None)
        }
      }
    }


    "can edit category notf prefs" - {
      "insert notf prefs, for a category" in {
        dao.readWriteTransaction { tx =>
          tx.upsertPageNotfPref(PageNotfPref(
            userOne.id,
            pageId = None,
            pagesInCategoryId = Some(defCatId),
            notfLevel = WatchingFirst))
        }
      }

      "see the edits" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, Some(defCatId)) mustBe PageNotfLevels(
            forPage = None,
            forCategory = Some(WatchingFirst),
            forWholeSite = None)
        }
      }

      "didn't edit the 2nd cat's notf level" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, Some(otherCatId)) mustBe PageNotfLevels(
            forPage = None,
            forCategory = Some(NotfLevel.TopicSolved),
            forWholeSite = None)
        }
      }
    }


    // ----- Whole site


    "can config notf prefs, for whole site" - {
      "insert notf prefs, for the whole site" in {
        dao.readWriteTransaction { tx =>
          tx.upsertPageNotfPref(PageNotfPref(
            userOne.id,
            wholeSite = true,
            notfLevel = Muted))
        }
      }

      "find again" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, None) mustBe PageNotfLevels(
            forPage = None,
            forCategory = None,
            forWholeSite = Some(Muted))
        }
      }

      "... not for the wrong user" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userTwo.id /* wrong */, pageIdThree, None) mustBe PageNotfLevels()
        }
      }

      "didn't overwrite any other notf prefs" in {
        checkDidntOverwritePageAndCatsPrefs(siteNotfLevel = Some(Muted))
      }
    }

    def checkDidntOverwritePageAndCatsPrefs(siteNotfLevel: Option[NotfLevel]) {
      dao.readOnlyTransaction { tx =>
        tx.loadEffectiveNotfLevels(userOne.id, pageIdOne, None) mustBe PageNotfLevels(
          forPage = Some(Hushed),
          forWholeSite = siteNotfLevel)
        tx.loadEffectiveNotfLevels(userOne.id, pageIdTwo, None) mustBe PageNotfLevels(
          forPage = Some(WatchingAll),
          forWholeSite = siteNotfLevel)
        tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, Some(defCatId)) mustBe PageNotfLevels(
          forCategory = Some(WatchingFirst),
          forWholeSite = siteNotfLevel)
        tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, Some(otherCatId)) mustBe PageNotfLevels(
          forCategory = Some(TopicSolved),
          forWholeSite = siteNotfLevel)
      }
    }

    "can edit site notf prefs" - {
      "update notf prefs, for the whole site" in {
        dao.readWriteTransaction { tx =>
          tx.upsertPageNotfPref(PageNotfPref(userOne.id, wholeSite = true, notfLevel = WatchingAll))
        }
      }

      "find again" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdThree, None) mustBe PageNotfLevels(
            forWholeSite = Some(WatchingAll))
        }
      }

      "... not for the wrong user" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userTwo.id /* wrong */, pageIdThree, None) mustBe PageNotfLevels()
        }
      }

      "didn't overwrite any other notf prefs" in {
        checkDidntOverwritePageAndCatsPrefs(siteNotfLevel = Some(WatchingAll))
      }
    }


    // ----- All together


    "can load page, cat and whole site notf levels at once" - {
      "do load" in {
        dao.readOnlyTransaction { tx =>
          tx.loadEffectiveNotfLevels(userOne.id, pageIdOne, Some(defCatId)) mustBe PageNotfLevels(
            forPage = Some(Hushed),
            forCategory = Some(WatchingFirst),
            forWholeSite = Some(WatchingAll))
        }
      }
    }




    // move to notf-dao-spec_for-watch-settings:
    //  member watches page
    //  member watches category
    //  member watches whole site

    //  event on other page —> nothing

    //  group watches page
    //  group watches category
    //  group watches whole site

    //  group watches page,           member has muted
    //  group watches category,       member has muted
    //  group watches whole site,     member has muted

    //  group has muted page,      member watches all posts
    //  group has muted category,  member watches page, all posts
    //  group has muted category,  member watches category, new topics

    //  group watches new-topics category,    member watches all, page
    //  group watches new-topics category,    member watches all, category
    //  group watches new-topics category,    member watches all, whole site

    //  group watches new-topics whole-site,    member watches all, page
    //  group watches new-topics whole-site,    member watches all, category
    //  group watches new-topics whole-site,    member watches all, whole site

    //  group A watches page, every post
    //  group B watches page, muted
    //    —> max notf level
    //  swap A <–> B, try again, should be max notf level again
  }

}
