"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isContactOption1Open, setIsContactOption1Open] = useState(false);
  const [isEmailCopied, setIsEmailCopied] = useState(false);
  const autoScrollLockRef = useRef(false);
  const unlockRafRef = useRef<number | null>(null);
  const unlockTimerRef = useRef<number | null>(null);
  const emailCopyResetTimerRef = useRef<number | null>(null);

  const clearUnlockWatchers = useCallback(() => {
    if (unlockRafRef.current !== null) {
      window.cancelAnimationFrame(unlockRafRef.current);
      unlockRafRef.current = null;
    }
    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
  }, []);

  const clearEmailCopyResetTimer = useCallback(() => {
    if (emailCopyResetTimerRef.current !== null) {
      window.clearTimeout(emailCopyResetTimerRef.current);
      emailCopyResetTimerRef.current = null;
    }
  }, []);

  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("sobor.jakub@gmail.com");
      setIsEmailCopied(true);
      clearEmailCopyResetTimer();
      emailCopyResetTimerRef.current = window.setTimeout(() => {
        setIsEmailCopied(false);
      }, 1400);
    } catch {
      setIsEmailCopied(false);
    }
  }, [clearEmailCopyResetTimer]);

  const lockUntilSectionSettled = useCallback(
    (targetSection: HTMLElement) => {
      autoScrollLockRef.current = true;
      clearUnlockWatchers();

      const targetTop = targetSection.offsetTop;
      let stableFrames = 0;

      const checkReachedTarget = () => {
        const distance = Math.abs(window.scrollY - targetTop);
        if (distance <= 2) {
          stableFrames += 1;
          if (stableFrames >= 2) {
            autoScrollLockRef.current = false;
            clearUnlockWatchers();
            return;
          }
        } else {
          stableFrames = 0;
        }

        unlockRafRef.current = window.requestAnimationFrame(checkReachedTarget);
      };

      unlockRafRef.current = window.requestAnimationFrame(checkReachedTarget);
      unlockTimerRef.current = window.setTimeout(() => {
        autoScrollLockRef.current = false;
        clearUnlockWatchers();
      }, 1800);
    },
    [clearUnlockWatchers]
  );

  const getScrollSections = useCallback(
    () =>
      Array.from(
        document.querySelectorAll<HTMLElement>("[data-scroll-section='true']")
      ),
    []
  );

  const getActiveSectionIndex = useCallback((sections: HTMLElement[]) => {
    const probeY = window.scrollY + window.innerHeight * 0.4;

    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index];
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (probeY >= top && probeY < bottom) {
        return index;
      }
    }

    let closestIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const distance = Math.abs(section.offsetTop - window.scrollY);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, []);

  const scrollBySection = useCallback(
    (direction: 1 | -1) => {
      if (autoScrollLockRef.current) {
        return false;
      }

      const sections = getScrollSections();
      if (sections.length < 2) {
        return false;
      }

      const currentIndex = getActiveSectionIndex(sections);
      const targetIndex = Math.min(
        sections.length - 1,
        Math.max(0, currentIndex + direction)
      );

      if (targetIndex === currentIndex) {
        return false;
      }

      lockUntilSectionSettled(sections[targetIndex]);
      sections[targetIndex].scrollIntoView({ behavior: "smooth", block: "start" });

      return true;
    },
    [getActiveSectionIndex, getScrollSections, lockUntilSectionSettled]
  );

  useEffect(() => {
    const handleScroll = () => {
      const nextY = window.scrollY;
      setScrollY(nextY);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(
    () => () => {
      clearUnlockWatchers();
      clearEmailCopyResetTimer();
    },
    [clearUnlockWatchers, clearEmailCopyResetTimer]
  );

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (autoScrollLockRef.current) {
        event.preventDefault();
        return;
      }

      if (Math.abs(event.deltaY) < 3) {
        return;
      }

      const direction: 1 | -1 = event.deltaY > 0 ? 1 : -1;
      scrollBySection(direction);
      event.preventDefault();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [scrollBySection]);

  useEffect(() => {
    const handleTouchMove = (event: TouchEvent) => {
      if (autoScrollLockRef.current) {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!autoScrollLockRef.current) {
        return;
      }

      const scrollKeys = new Set([
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ]);

      if (scrollKeys.has(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown, { passive: false });

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <main className="relative min-h-[200vh] bg-[#6a4b3c]">
      {/* Hero section */}
      <section
        data-scroll-section="true"
        className="relative w-full overflow-hidden bg-[#e5d0b3]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, #e5d0b3 0%, #e5d0b3 99%, #6a4b3c 99%, #6a4b3c 100%)",
        }}
        >
        {/* Hello message */}
        <div className="pointer-events-none absolute left-6 top-8 z-0 md:left-[12vw] md:top-[12vw]">
          <div
            className="inline-flex flex-col items-start p-2 md:p-3"
            style={{ transform: `translate3d(0, ${scrollY * 0.55}px, 0)` }}
          >
            <p className="select-none text-left text-[clamp(2.6rem,7.6vw,6.8rem)] font-black leading-[0.87] tracking-[-0.03em] text-[#2a1a12] [transform:rotate(-4deg)] motion-safe:animate-[floatHello_7.6s_ease-in-out_infinite] motion-reduce:animate-none">
              Hi!
            </p>
            <div className="mt-1 inline-flex items-end gap-2 text-[clamp(1.8rem,5.2vw,4.7rem)] font-black leading-[0.9] tracking-[-0.026em] text-[#2a1a12] transform-[rotate(3deg)]">
              <p className="ml-1.5 select-none whitespace-nowrap motion-safe:animate-[floatIm_6.9s_ease-in-out_infinite] motion-reduce:animate-none md:ml-6">
                I&apos;m
              </p>
              <p className="select-none whitespace-nowrap motion-safe:animate-[floatJacob_6.3s_ease-in-out_infinite] motion-reduce:animate-none">
                Jacob
              </p>
              <Image
                src="/coffee-icon.png"
                alt="Coffee icon"
                width={160}
                height={160}
                className="mb-[-0.02em] ml-1 h-[1.36em] w-[1.36em] translate-y-[0.08em] object-contain drop-shadow-[3px_4px_4px_rgba(38,22,14,0.35)] motion-safe:animate-[floatCup_5.7s_ease-in-out_infinite] motion-reduce:animate-none md:ml-4"
              />
            </div>
          </div>
        </div>
        {/* Decorative SVG */}
        <div className="pointer-events-none relative z-10">
          <svg
            className="block h-auto w-full"
            viewBox="0 0 200 120"
            preserveAspectRatio="xMinYMin meet"
            aria-hidden="true"
          >
            <path
              d="M 0 102 C 40 113 68 101 92 51 C 117 -2 177 16 200 -4 L 200 120 L 0 120 Z"
              fill="#6a4b3c"
              style={{
                filter:
                  "drop-shadow(0px 0px 2px rgba(37,22,14,0.5))",
              }}
            />
          </svg>
        </div>
        {/* Description */}
        <div className="absolute left-[54%] top-9 z-20 w-[min(92vw,42rem)] -translate-x-1/2 md:left-[73vw] md:top-[15.5vw] md:w-[min(54vw,42rem)]">
          <section className="w-full max-w-[42rem] p-6 md:p-8">
            <p className="bg-gradient-to-r from-[#eec58f] to-[#f6ddba] bg-clip-text text-[1.28rem] font-semibold uppercase tracking-[0.18em] text-transparent md:text-[1.44rem]">
              Frontend Developer
            </p>
            <p className="mt-7 max-w-[56ch] text-[1.1rem] leading-[1.86] tracking-[0.02em] text-[#f8efe1]/95 md:text-[1.18rem]">
              I focus on building accessible, user-friendly interfaces that are
              practical, visually appealing, and easy to navigate. I pay close
              attention to detail, refining even the smallest elements to
              create smooth, intuitive experiences. My goal is to deliver
              websites that feel comfortable to use, perform reliably, and
              communicate their purpose clearly without unnecessary complexity.
              <br /><br />
              Outside of coding, I enjoy learning new languages, practicing
              violin, and traveling whenever I get the chance to explore new
              places.
            </p>
          </section>
        </div>
      </section>

      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="pointer-events-auto absolute bottom-10 right-10 flex items-center gap-8">
          <div
            className={`relative z-20 isolate flex h-[3rem] items-center rounded-full border border-[#f0d6b3]/45 bg-[#4f3729] px-0 text-sm text-[#fff6e8] shadow-[0_8px_20px_rgba(24,14,8,0.34)] transition-all duration-300 ease-out ${
              isContactOption1Open
                ? "translate-x-0 opacity-100"
                : "pointer-events-none translate-x-8 opacity-0"
            }`}
          >
            <a
              href="https://github.com/xChineseRicex"
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex h-full items-center gap-2 pl-6 pr-5 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              <Image
                src="/coffee-icon.png"
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
              GitHub
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-none border border-[#f0d6b3]/40 bg-[#3f2b1f]/92 px-2.5 py-1 text-[0.65rem] font-semibold normal-case tracking-[0.02em] text-[#fff6e8] opacity-0 shadow-[0_4px_10px_rgba(24,14,8,0.3)] transition-all duration-150 group-hover:-translate-y-0.5 group-hover:opacity-100">
                github.com/xChineseRicex
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-full -translate-x-1/2"
                >
                  <svg
                    width="12"
                    height="7"
                    viewBox="0 0 12 7"
                    className="block"
                    aria-hidden="true"
                  >
                    <path d="M0 0 L6 7 L12 0 Z" fill="rgba(63, 43, 31, 0.92)" />
                    <path
                      d="M0.8 0.5 L6 6.6 L11.2 0.5"
                      fill="none"
                      stroke="rgba(240, 214, 179, 0.4)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </a>
            <span
              aria-hidden="true"
              className="h-full w-px bg-[#f0d6b3]/35"
            />
            <div className="group relative inline-flex h-full items-stretch">
              <a
                href="mailto:sobor.jakub@gmail.com"
                className="relative z-20 inline-flex h-full items-center gap-2 px-5 text-xs font-semibold uppercase tracking-[0.14em]"
              >
                <Image
                  src="/coffee-icon.png"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                />
                E-mail
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-none border border-[#f0d6b3]/40 bg-[#3f2b1f]/92 px-2.5 py-1 text-[0.65rem] font-semibold normal-case tracking-[0.02em] text-[#fff6e8] opacity-0 shadow-[0_4px_10px_rgba(24,14,8,0.3)] transition-all duration-150 group-hover:-translate-y-0.5 group-hover:opacity-100">
                  sobor.jakub@gmail.com
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-full -translate-x-1/2"
                  >
                    <svg
                      width="12"
                      height="7"
                      viewBox="0 0 12 7"
                      className="block"
                      aria-hidden="true"
                    >
                      <path d="M0 0 L6 7 L12 0 Z" fill="rgba(63, 43, 31, 0.92)" />
                      <path
                        d="M0.8 0.5 L6 6.6 L11.2 0.5"
                        fill="none"
                        stroke="rgba(240, 214, 179, 0.4)"
                        strokeWidth="1"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </span>
              </a>
              <div className="pointer-events-none absolute left-[-1px] top-full -z-10 h-9 w-[calc(100%+2px)] overflow-hidden group-hover:pointer-events-auto group-hover:overflow-visible group-focus-within:pointer-events-auto group-focus-within:overflow-visible">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="cursor-pointer absolute left-0 top-0 w-full origin-top -translate-y-full whitespace-nowrap rounded-none border border-[#f0d6b3]/40 bg-[#3f2b1f] px-2.5 py-1.5 text-[0.62rem] font-semibold tracking-[0.01em] text-[#fff6e8] opacity-0 shadow-[0_3px_8px_rgba(24,14,8,0.28)] transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 hover:scale-[1.03] active:scale-[0.98]"
                >
                  {isEmailCopied ? "Copied!" : "Copy instead?"}
                </button>
              </div>
            </div>
            <span
              aria-hidden="true"
              className="h-full w-px bg-[#f0d6b3]/35"
            />
            <a
              href="https://www.linkedin.com/in/jakub-sob%C3%B3r-56351723a/"
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex h-full items-center gap-2 pl-5 pr-6 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              <Image
                src="/coffee-icon.png"
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
              LinkedIn
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-none border border-[#f0d6b3]/40 bg-[#3f2b1f]/92 px-2.5 py-1 text-[0.65rem] font-semibold normal-case tracking-[0.02em] text-[#fff6e8] opacity-0 shadow-[0_4px_10px_rgba(24,14,8,0.3)] transition-all duration-150 group-hover:-translate-y-0.5 group-hover:opacity-100">
                linkedin.com/in/jakub-sobór
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-full -translate-x-1/2"
                >
                  <svg
                    width="12"
                    height="7"
                    viewBox="0 0 12 7"
                    className="block"
                    aria-hidden="true"
                  >
                    <path d="M0 0 L6 7 L12 0 Z" fill="rgba(63, 43, 31, 0.92)" />
                    <path
                      d="M0.8 0.5 L6 6.6 L11.2 0.5"
                      fill="none"
                      stroke="rgba(240, 214, 179, 0.4)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsContactOption1Open((prev) => !prev);
            }}
            className="flex h-12 cursor-pointer items-center rounded-full border border-[#f0d6b3]/55 bg-[#4f3729] px-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#f8eedd] shadow-[0_8px_20px_rgba(24,14,8,0.38)] transition-transform duration-150 hover:scale-110 active:scale-95 active:duration-75"
            aria-expanded={isContactOption1Open}
            aria-label="Toggle contact links"
          >
            Contact
          </button>
        </div>
      </div>

      <section
        data-scroll-section="true"
        className="relative flex h-screen w-full items-center justify-center bg-[#6a4b3c] text-[#f8eedd]"
      >
        <p className="text-sm uppercase tracking-[0.22em] text-[#f0d6b3]/75">
          Next Section - coming soon
        </p>
      </section>
    </main>
  );
}
